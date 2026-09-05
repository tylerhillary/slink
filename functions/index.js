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
const stats = require('./lib/stats');

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

    /* The public figures on the site come from public/stats. Refresh them
       here so a new member is reflected without waiting for the sweep. A
       failure must never fail the registration itself. */
    try {
      await stats.recomputeStats(admin.firestore());
    } catch (error) {
      functions.logger.error('Stats refresh failed', { detail: error?.message || error });
    }

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

      /* Recount from scratch and backfill any missing directory entries. */
      const counts = await stats.recomputeStats(admin.firestore(), { backfillDirectory: true });
      functions.logger.info('Stats republished', {
        activeMembers: counts.activeMembers,
        skillsTotal: counts.skillsTotal,
        statesCovered: counts.statesCovered,
        directoryCreated: counts.directoryCreated,
      });
    } catch (error) {
      functions.logger.error('Sweep failed', { detail: error?.message || error });
    }

    return null;
  });
