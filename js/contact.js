    // Enhanced Contact Form Validation and Functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
          menuToggle.addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.toggle('hidden');
          });
        }
        
        // Update cart counter
        updateCartCount();
        
        // Setup form validation and submission
        setupContactForm();
        
        // Setup success message close button
        const closeSuccessBtn = document.getElementById('close-success');
        if (closeSuccessBtn) {
          closeSuccessBtn.addEventListener('click', hideSuccessMessage);
        }
      });
  
      function setupContactForm() {
        const form = document.getElementById('contact-form');
        const phoneInput = document.getElementById('phone');
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        
        // Real-time phone number validation
        if (phoneInput) {
          phoneInput.addEventListener('input', function(e) {
            // Remove any non-numeric characters except +, -, (, ), and spaces
            let value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
            e.target.value = value;
            
            // Real-time validation feedback
            if (value && !isValidPhone(value)) {
              e.target.classList.add('border-red-500');
              e.target.classList.remove('border-gray-300');
            } else {
              e.target.classList.remove('border-red-500');
              e.target.classList.add('border-gray-300');
            }
          });
        }
        
        // Real-time name validation (letters and spaces only)
        [firstNameInput, lastNameInput].forEach(input => {
          if (input) {
            input.addEventListener('input', function(e) {
              // Remove any non-letter characters except spaces
              let value = e.target.value.replace(/[^A-Za-z\s]/g, '');
              e.target.value = value;
            });
          }
        });
        
        // Form submission
        if (form) {
          form.addEventListener('submit', handleContactFormSubmission);
        }
      }
  
      function handleContactFormSubmission(event) {
        event.preventDefault();
        
        // Get form data
        const formData = {
          firstName: document.getElementById('first-name').value.trim(),
          lastName: document.getElementById('last-name').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          subject: document.getElementById('subject').value,
          message: document.getElementById('message').value.trim(),
          privacy: document.getElementById('privacy').checked
        };
        
        // Validate form
        if (!validateContactForm(formData)) {
          return;
        }
        
        // Simulate form submission
        simulateFormSubmission(formData);
      }
  
      function validateContactForm(formData) {
        clearFormErrors();
        let isValid = true;
        
        // Validate required fields
        if (!formData.firstName) {
          showFieldError('first-name', 'Voornaam is verplicht');
          isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
          showFieldError('first-name', 'Alleen letters en spaties toegestaan');
          isValid = false;
        }
        
        if (!formData.lastName) {
          showFieldError('last-name', 'Achternaam is verplicht');
          isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
          showFieldError('last-name', 'Alleen letters en spaties toegestaan');
          isValid = false;
        }
        
        if (!formData.email) {
          showFieldError('email', 'E-mailadres is verplicht');
          isValid = false;
        } else if (!isValidEmail(formData.email)) {
          showFieldError('email', 'Voer een geldig e-mailadres in');
          isValid = false;
        }
        
        if (!formData.subject) {
          showFieldError('subject', 'Selecteer een onderwerp');
          isValid = false;
        }
        
        if (!formData.message) {
          showFieldError('message', 'Bericht is verplicht');
          isValid = false;
        } else if (formData.message.length < 10) {
          showFieldError('message', 'Bericht moet minimaal 10 karakters bevatten');
          isValid = false;
        }
        
        if (!formData.privacy) {
          showFieldError('privacy', 'U moet akkoord gaan met de privacyverklaring');
          isValid = false;
        }
        
        // Validate phone number if provided
        if (formData.phone && !isValidPhone(formData.phone)) {
          showFieldError('phone', 'Voer een geldig Nederlands telefoonnummer in');
          isValid = false;
        }
        
        return isValid;
      }
  
      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }
  
      function isValidPhone(phone) {
        // Remove all non-digit characters for validation
        const cleanPhone = phone.replace(/\D/g, '');
        // Dutch phone numbers: 10 digits for landline (050-1234567) or mobile (06-12345678)
        return cleanPhone.length >= 9 && cleanPhone.length <= 11;
      }
  
      function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Add error styling
        field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        field.classList.remove('border-gray-300', 'focus:border-teal-500', 'focus:ring-teal-500');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
          errorElement = document.createElement('p');
          errorElement.className = 'error-message mt-1 text-sm text-red-600';
          field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
      }
  
      function clearFormErrors() {
        // Remove error styling from all fields
        const fields = document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea');
        fields.forEach(field => {
          field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
          field.classList.add('border-gray-300', 'focus:border-teal-500', 'focus:ring-teal-500');
        });
        
        // Remove error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.remove());
      }
  
      function simulateFormSubmission(formData) {
        const submitButton = document.querySelector('#contact-form button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Bezig met verzenden...
        `;
        
        // Simulate network delay
        setTimeout(() => {
          // Save to localStorage (demo)
          saveContactMessage(formData);
          
          // Reset form
          document.getElementById('contact-form').reset();
          clearFormErrors();
          
          // Reset button
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          
          // Show success message
          showSuccessMessage();
        }, 1500);
      }
  
      function saveContactMessage(formData) {
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        
        const message = {
          id: Date.now(),
          date: new Date().toISOString(),
          ...formData,
          status: 'new'
        };
        
        contactMessages.push(message);
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        console.log('Contact message saved:', message);
      }
  
      function showSuccessMessage() {
        const successModal = document.getElementById('success-message');
        if (successModal) {
          successModal.classList.remove('hidden');
          
          // Focus on OK button for accessibility
          const okButton = document.getElementById('close-success');
          if (okButton) {
            setTimeout(() => okButton.focus(), 100);
          }
          
          // Auto-close after 5 seconds
          setTimeout(hideSuccessMessage, 5000);
        }
      }
  
      function hideSuccessMessage() {
        const successModal = document.getElementById('success-message');
        if (successModal) {
          successModal.classList.add('hidden');
        }
      }
  
      function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (!cartCountElement) return;
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCountElement.textContent = itemCount;
      }