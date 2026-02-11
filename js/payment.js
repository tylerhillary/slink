// Payment page functionality

// Function to handle payment submission
function handlePayment(event) {
  event.preventDefault();
  
  // Show alert about contacting the admin
  showInfo('To complete your payment, please call our admin at +234(808-489-1200). Our admin will assist you with the payment process and connect you with your chosen mentor.');
  
  // Optionally, open the phone dialer
  if (confirm('Would you like to call the admin now?')) {
    window.location.href = 'tel:+2348084891200';
  }
}

// Function to call the admin directly
function callAdmin() {
  if (confirm('Calling admin at +234(808-489-1200). Proceed?')) {
    window.location.href = 'tel:+2348084891200';
  }
}

// Function to simulate payment processing
function processPayment(cardNumber, expiryDate, cvv, cardName, email) {
  // Show loading state
  const submitButton = document.querySelector('#paymentForm .btn--primary');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Processing...';
  submitButton.disabled = true;
  
  // Simulate API call delay
  setTimeout(() => {
    // Restore button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    
    // Show success message
    showSuccess('Payment successful! You will be redirected to your dashboard shortly.');
    
    // In a real implementation, this would redirect to a success page
    // For this prototype, we'll redirect to the messages page after a delay
    setTimeout(() => {
      window.location.href = 'messages.html';
    }, 2000);
  }, 2000);
}

// Function to handle payment method selection
function selectPaymentMethod(method) {
  // Remove active class from all options
  document.querySelectorAll('.payment-option').forEach(option => {
    option.classList.remove('active');
  });
  
  // Add active class to selected option
  const selectedOption = document.querySelector(`input[value="${method}"]`).parentElement;
  selectedOption.classList.add('active');
}

// Initialize payment page
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for payment form submission
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePayment);
  }
  
  // Add event listeners for payment method selection
  const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
  paymentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      selectPaymentMethod(e.target.value);
    });
  });
});