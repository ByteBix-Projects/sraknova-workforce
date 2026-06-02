/**
 * SRAKNOVA WORKFORCE SOLUTION PRIVATE LIMITED
 * Main Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSecurityCalculator();
  setupFAQAccordion();
  setupScrollReveal();
  setupContactForm();
});

/**
 * Navigation and Sticky Glass Header
 */
function setupNavigation() {
  const header = document.querySelector('.header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    updateActiveNavLink();
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    header.classList.toggle('menu-open', isOpen);
    
    // Toggle hamburger icon
    menuToggle.innerHTML = isOpen 
      ? `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
      : `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
  });

  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      header.classList.remove('menu-open');
      menuToggle.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
    });
  });

  // Active link highlighter
  function updateActiveNavLink() {
    let fromTop = window.scrollY + 120;
    
    navLinks.forEach(link => {
      const sectionId = link.getAttribute('href');
      if (sectionId.startsWith('#')) {
        const section = document.querySelector(sectionId);
        if (section) {
          if (
            section.offsetTop <= fromTop &&
            section.offsetTop + section.offsetHeight > fromTop
          ) {
            navLinks.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
          }
        }
      }
    });
  }
}

/**
 * Security Personnel Cost Estimator
 */
function setupSecurityCalculator() {
  const guardTypeSelect = document.getElementById('guardType');
  const shiftHoursSelect = document.getElementById('shiftHours');
  const guardCountRange = document.getElementById('guardCount');
  const guardCountValue = document.getElementById('guardCountValue');
  const shiftRadios = document.querySelectorAll('input[name="shiftType"]');
  const calcTotal = document.getElementById('calcTotal');
  const calcCheckcards = document.querySelectorAll('.calc-checkbox-card');

  // Base Monthly Rates (per guard in INR based on standard regional rates)
  const RATES = {
    standard: 15000, // Basic Guard
    supervisor: 21000, // Supervisor / Shift Leader
    armed: 27000     // Elite / Armed Personal Guard
  };

  // Duration Multipliers
  const SHIFT_MULTIPLIERS = {
    '8': 1.0,      // 8 hours shift
    '12': 1.45,    // 12 hours shift (includes overtime)
    '24': 2.85     // 24/7 continuous coverage (requires 3 shifts rotating)
  };

  // Shift Timing Allowance Multipliers
  const SHIFT_TYPE_MULTIPLIERS = {
    day: 1.0,
    night: 1.12,  // 12% night shift allowance
  };

  // Handle radio custom card styling
  calcCheckcards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener('click', () => {
      radio.checked = true;
      calcCheckcards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      calculateCost();
    });
  });

  // Event Listeners for inputs
  guardTypeSelect.addEventListener('change', calculateCost);
  shiftHoursSelect.addEventListener('change', () => {
    // If 24 hour shift is selected, disable night shift allowance card because it's a 24/7 rotation that includes night
    const shiftHours = shiftHoursSelect.value;
    const nightRadioCard = document.querySelector('input[value="night"]').closest('.calc-checkbox-card');
    const dayRadioCard = document.querySelector('input[value="day"]').closest('.calc-checkbox-card');
    
    if (shiftHours === '24') {
      dayRadioCard.click(); // force select day (standard base)
      nightRadioCard.style.opacity = '0.5';
      nightRadioCard.style.pointerEvents = 'none';
    } else {
      nightRadioCard.style.opacity = '1';
      nightRadioCard.style.pointerEvents = 'auto';
    }
    
    calculateCost();
  });
  
  guardCountRange.addEventListener('input', () => {
    guardCountValue.textContent = guardCountRange.value;
    calculateCost();
  });

  function calculateCost() {
    const type = guardTypeSelect.value;
    const shiftHours = shiftHoursSelect.value;
    const count = parseInt(guardCountRange.value, 10);
    
    let shiftType = 'day';
    shiftRadios.forEach(radio => {
      if (radio.checked) {
        shiftType = radio.value;
      }
    });

    const baseRate = RATES[type];
    const durationMult = SHIFT_MULTIPLIERS[shiftHours];
    // Night allowance only applicable if not 24 hours
    const shiftMult = (shiftHours === '24') ? 1.0 : SHIFT_TYPE_MULTIPLIERS[shiftType];

    // Compute monthly estimate
    const monthlyTotal = Math.round(baseRate * durationMult * shiftMult * count);
    
    // Format currency to INR format (e.g. ₹ 1,50,000)
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(monthlyTotal);

    calcTotal.textContent = formatted;
  }

  // Initial calculation run
  calculateCost();
}

/**
 * FAQ Accordion Toggler
 */
function setupFAQAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const isActive = item.classList.contains('active');

      // Close all items first
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = null;
      });

      // If clicked item was not active, open it
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Scroll Reveal Animations
 */
function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    reveals.forEach(reveal => {
      const revealTop = reveal.getBoundingClientRect().top;
      
      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('active');
      }
    });
  };

  // Run on initial load and scroll
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

/**
 * Contact Intake Form Setup
 */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusMsg = document.getElementById('formStatusMsg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Validation
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const message = document.getElementById('clientMsg').value.trim();

    if (!name || !phone || !email) {
      showStatus('Please fill in all required fields (Name, Phone, and Email).', 'error');
      return;
    }

    // Simple phone regex
    const phoneRegex = /^[6-9]\d{9}$/; // standard Indian mobile number
    const cleanPhone = phone.replace(/[\s-+]/g, '');
    const mobileDigits = cleanPhone.slice(-10);
    
    if (mobileDigits.length !== 10 || !/^\d+$/.test(mobileDigits)) {
      showStatus('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    // Disable button & show sending state
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending Request...
    `;

    // Simulate Server Request (1.5 seconds delay)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      // Successful message
      showStatus(`Thank you, ${name}! Your security consultation request has been received. Our Operations Team led by Director Atish Kumar will reach out to you within 24 hours on ${phone}.`, 'success');
      form.reset();
      
      // Update calculator checkbox visual elements to default values
      const defaultRadioCard = document.querySelector('input[value="day"]').closest('.calc-checkbox-card');
      defaultRadioCard.click();
    }, 1500);
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = 'form-status-msg'; // reset
    statusMsg.classList.add(type);
    
    // Auto scroll to message
    statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    if (type === 'success') {
      // Hide error messages/success messages after 10s
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 10000);
    }
  }
}

// Add simple spinning animation style for the loader
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);
