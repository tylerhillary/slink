'use strict';

/**
 * Cloud Functions entry points.
 *
 * All the actual work lives in lib/pipeline.js so the same logic can run
 * without Cloud Functions at all — see scripts/process-queue.js, which is the
 * free-plan path. Keep this file thin; put behaviour in the pipeline.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const config = require('./lib/config');
const pipeline = require('./lib/pipeline');

functions.logger.info('Slink360 functions booted', {
  mailProvider: config.resolvedProvider,
  autoIntroduce: config.autoIntroduce,
  requireReciprocal: config.requireReciprocal,
  minMatchScore: config.minMatchScore,
});

/* New registration -> acknowledge immediately, then try to match. */
exports.onRegistrationCreated = functions
  .runWith({ timeoutSeconds: 120, memory: '256MB' })
  .firestore.document('registrations/{registrationId}')
  .onCreate(async (snap, context) => {
    await pipeline.processRegistration({
      registrationId: context.params.registrationId,
      data: snap.data() || {},
      ref: snap.ref,
      notifyAdminOnMiss: true,
    });
    return null;
  });

/* Contact form -> notify the desk. */
exports.onContactSubmissionCreated = functions
  .firestore.document('contactSubmissions/{submissionId}')
  .onCreate(async (snap, context) => {
    try {
      await pipeline.processContactSubmission({
        submissionId: context.params.submissionId,
        data: snap.data() || {},
      });
    } catch (error) {
      functions.logger.error('Contact notification failed', {
        submissionId: context.params.submissionId,
        detail: error?.message || error,
      });
    }
    return null;
  });

/* Catch-up sweep -> pair registrations that had no partner when they arrived. */
exports.sweepUnmatchedRegistrations = functions
  .runWith({ timeoutSeconds: 540, memory: '256MB' })
  .pubsub.schedule('every 6 hours')
  .timeZone('Africa/Lagos')
  .onRun(async () => {
    if (!config.autoIntroduce) {
      functions.logger.info('Sweep skipped — automatic introductions are disabled');
      return null;
    }

    try {
      const summary = await pipeline.processPendingQueue({ notifyAdminOnMiss: false });
      functions.logger.info('Sweep complete', {
        scanned: summary.scanned,
        matched: summary.matched,
        skippedOld: summary.skippedOld,
      });
    } catch (error) {
      functions.logger.error('Sweep failed', { detail: error?.message || error });
    }

    return null;
  });
