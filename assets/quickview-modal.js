document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('quickview-modal');
  const content = modal.querySelector('.quickview-content');
  const loader = document.getElementById('quickview-loader');

  document.addEventListener('click', function (e) {
    const icon = e.target.closest('.quickview-icon');
    if (icon) {
      const handle = icon.getAttribute('data-product-handle');
      const url = `/products/${handle}?section_id=product-quick-view`;

      loader.style.display = 'block';
      modal.style.display = 'flex';

      fetch(url)
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;
          loader.style.display = 'none';

          // Execute scripts in the loaded content
          const scripts = content.querySelectorAll('script');
          scripts.forEach(script => {
            if (script.innerHTML.trim()) {
              try {
                const newScript = document.createElement('script');
                newScript.innerHTML = script.innerHTML;
                document.head.appendChild(newScript);
                document.head.removeChild(newScript);
              } catch (error) {
                // Silent error handling
              }
            }
          });

          // Reinitialize Splide after injecting HTML
          const splideEl = content.querySelector('.splide');
          if (splideEl) {
            new Splide(splideEl, {
              type: 'loop',
              perPage: 1,
              pagination: true,
              arrows: true,
            }).mount();
          }

          // Initialize variant picker after content is loaded
          const productContainer = content.querySelector('.quick-view__container');
          if (productContainer) {
            const form = content.querySelector('[data-product-form]');
            const splideElement = content.querySelector('[id^="quickview-splide-"]');
            
            if (form && splideElement) {
              const productId = splideElement.id.replace('quickview-splide-', '');
              let formId;
              
              if (typeof form.id === 'string' && form.id) {
                formId = form.id;
              } else {
                formId = 'quick-view-form-' + productId;
                form.id = formId;
              }
              
              // Initialize variant picker
              const initQuickViewInline = function(productId, productFormId) {
                const form = document.querySelector('#' + productFormId);
                if (!form) return;

                const variantButtons = form.querySelectorAll('.variant-button');
                const variants = window['variants_' + productId];

                if (!variants || variantButtons.length === 0) return;

                // Get current selected options
                function getCurrentOptions() {
                  const options = [];
                  const optionGroups = form.querySelectorAll('.variant-buttons-grid');
                  
                  optionGroups.forEach(group => {
                    const selectedButton = group.querySelector('.variant-button.selected');
                    if (selectedButton) {
                      options.push(selectedButton.getAttribute('data-value'));
                    }
                  });
                  
                  return options;
                }

                // Update variant availability
                function updateAvailability() {
                  const selectedOptions = getCurrentOptions();
                  
                  // For each option group
                  form.querySelectorAll('.variant-buttons-grid').forEach((group, optionIndex) => {
                    const buttons = group.querySelectorAll('.variant-button');
                    
                    buttons.forEach(button => {
                      const testOptions = [...selectedOptions];
                      testOptions[optionIndex] = button.getAttribute('data-value');
                      
                      // Check if this combination exists and is available
                      const matchingVariant = variants.find(variant => 
                        variant.options.every((opt, i) => opt.trim() === testOptions[i]?.trim())
                      );
                      
                      if (!matchingVariant || !matchingVariant.available) {
                        button.disabled = true;
                        button.classList.add('unavailable');
                      } else {
                        button.disabled = false;
                        button.classList.remove('unavailable');
                      }
                    });
                  });
                }

                // Update variant details (price, compare price, etc.)
                function updateVariant() {
                  const selectedOptions = getCurrentOptions();

                  const variant = variants.find(v =>
                    v.options.every((opt, i) => opt.trim() === selectedOptions[i]?.trim())
                  );

                  if (variant) {
                    // Update hidden input
                    const hiddenInput = form.querySelector('input[name="id"]');
                    if (hiddenInput) hiddenInput.value = variant.id;

                    // Update price
                    const priceEl = form.querySelector('.price-wrapper .price');
                    if (priceEl) priceEl.innerHTML = variant.price_formatted;

                    // Update compare price
                    const compareEl = form.querySelector('.compare-price');
                    if (compareEl) {
                      if (variant.compare_at_price > variant.price) {
                        compareEl.innerHTML = variant.compare_at_price_formatted;
                        compareEl.style.display = 'inline';
                      } else {
                        compareEl.style.display = 'none';
                      }
                    }

                    // Update discount badge
                    const discountBadge = form.closest('.quick-view__container').querySelector('.discount-badge');
                    if (discountBadge) {
                      if (variant.compare_at_price > variant.price) {
                        const discount = Math.round(
                          ((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price
                        );
                        discountBadge.textContent = `-${discount}%`;
                        discountBadge.style.display = 'inline-block';
                      } else {
                        discountBadge.style.display = 'none';
                      }
                    }

                  }
                  
                  // Update availability after variant selection
                  updateAvailability();
                }

                // Add click event listeners to variant buttons
                variantButtons.forEach(button => {
                  button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.disabled) return;
                    
                    // Remove selected class from siblings
                    const siblings = this.parentElement.querySelectorAll('.variant-button');
                    siblings.forEach(sibling => sibling.classList.remove('selected'));
                    
                    // Add selected class to clicked button
                    this.classList.add('selected');

                    // Update selected value in label
                    const optionGroup = this.closest('.variant-option');
                    const selectedValueSpan = optionGroup.querySelector('.selected-value');
                    if (selectedValueSpan) {
                      selectedValueSpan.textContent = this.getAttribute('data-value');
                    }
                    
                    // Update variant
                    updateVariant();
                  });
                });

                // Initialize with first available variant
                updateVariant();
              };     
              initQuickViewInline(productId, formId);
            }
          }
        })
        .catch(() => {
          content.innerHTML = '<p>Failed to load product.</p>';
          loader.style.display = 'none';
        });
    }

    // Close modal if clicking outside content
    if (e.target === modal) {
      modal.style.display = 'none';
      content.innerHTML = '';
    }
  });
});

// Enhance the wishlist engine with better visual feedback
document.addEventListener('DOMContentLoaded', function() {
  
  // Function to update wishlist button text based on state
  function updateWishlistButtonText() {
    document.querySelectorAll('.wishlist-engine.wishlist-button-styled').forEach(function(button) {
      const textEl = button.querySelector('.wishlist-text');
      if (!textEl) return;
      
      // Check various possible classes your wishlist app might add
      if (button.classList.contains('active') || 
          button.classList.contains('added') || 
          button.classList.contains('in-wishlist') ||
          button.classList.contains('wishlisted')) {
        textEl.textContent = 'In Wishlist';
      } else {
        textEl.textContent = 'Wishlist';
      }
    });
  }
  
  // Initial check
  updateWishlistButtonText();
  
  // Watch for class changes on wishlist buttons
  const observer = new MutationObserver(function(mutations) {
    let shouldUpdate = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('wishlist-engine')) {
          shouldUpdate = true;
        }
      }
    });
    
    if (shouldUpdate) {
      updateWishlistButtonText();
    }
  });
  
  // Start observing
  document.querySelectorAll('.wishlist-engine').forEach(function(button) {
    observer.observe(button, {
      attributes: true,
      attributeFilter: ['class']
    });
  });
  
  // Also check after any AJAX requests (for your quickview modal)
  let originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(function(response) {
      setTimeout(updateWishlistButtonText, 100);
      return response;
    });
  };
  
  // Override XMLHttpRequest for older AJAX calls
  let originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      setTimeout(updateWishlistButtonText, 100);
    });
    return originalOpen.apply(this, arguments);
  };
  
});

// Add click feedback for better UX
document.addEventListener('click', function(e) {
  const wishlistEngine = e.target.closest('.wishlist-engine.wishlist-button-styled');
  if (wishlistEngine) {
    // Add a temporary clicked effect
    wishlistEngine.style.transform = 'scale(0.95)';
    setTimeout(() => {
      wishlistEngine.style.transform = '';
    }, 150);
  }
});

// Handle tooltip positioning (if your app doesn't handle it well)
document.addEventListener('mouseenter', function(e) {
  const wishlistEngine = e.target.closest('.wishlist-engine.wishlist-button-styled');
  if (wishlistEngine && wishlistEngine.hasAttribute('data-tooltip')) {
    const tooltip = wishlistEngine.getAttribute('data-tooltip');
    
    // Remove any existing tooltip
    const existingTooltip = document.querySelector('.custom-wishlist-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    
    // Create new tooltip
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'custom-wishlist-tooltip';
    tooltipEl.textContent = tooltip;
    tooltipEl.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    document.body.appendChild(tooltipEl);
    
    // Position tooltip
    const rect = wishlistEngine.getBoundingClientRect();
    tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
    tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 8 + 'px';
    
    // Show tooltip
    setTimeout(() => {
      tooltipEl.style.opacity = '1';
    }, 10);
  }
}, true);

document.addEventListener('mouseleave', function(e) {
  const wishlistEngine = e.target.closest('.wishlist-engine.wishlist-button-styled');
  if (wishlistEngine) {
    const tooltip = document.querySelector('.custom-wishlist-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }, 200);
    }
  }
}, true);

// Function to set modal height based on gallery
function setModalHeightFromGallery() {
  const modal = document.querySelector('.quickview-modal');
  const content = document.querySelector('.quickview-content');
  const gallery = document.querySelector('.quick-view__gallery');
  
  if (!modal || !content || !gallery) return;
  
  // Get viewport dimensions
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Calculate available space (accounting for padding)
  const availableHeight = viewportHeight - 40; // 20px padding top/bottom
  const availableWidth = viewportWidth - 40; // 20px padding left/right
  
  // Calculate ideal dimensions based on aspect ratio and available space
  let idealWidth = Math.min(980, availableWidth); // Max width from CSS
  
  // Calculate gallery width (58.333% of container)
  let galleryWidth = idealWidth * 0.58333;
  
  // Determine aspect ratio based on screen size or product type
  let aspectRatio = 4/3; // Default aspect ratio
  
  if (viewportWidth <= 768) {
    aspectRatio = 16/10; // Mobile aspect ratio
  }
  
  // You can also set different aspect ratios based on product type
  // Check for data attributes or classes
  if (gallery.classList.contains('square-aspect')) {
    aspectRatio = 1/1;
  } else if (gallery.classList.contains('tall-aspect')) {
    aspectRatio = 3/4;
  } else if (gallery.classList.contains('wide-aspect')) {
    aspectRatio = 16/9;
  }
  
  // Calculate ideal height based on gallery aspect ratio
  let idealHeight = galleryWidth / aspectRatio;
  
  // Add some padding for the info section if needed
  const minInfoHeight = 300; // Minimum height for product info
  idealHeight = Math.max(idealHeight, minInfoHeight);
  
  // Ensure we don't exceed available height
  idealHeight = Math.min(idealHeight, availableHeight);
  
  // Apply the calculated dimensions
  content.style.height = idealHeight + 'px';
  content.style.width = idealWidth + 'px';
  
  // For mobile, handle differently
  if (viewportWidth <= 768) {
    // On mobile, gallery takes natural height, info section gets remaining space
    const galleryHeight = galleryWidth / aspectRatio;
    const remainingHeight = Math.min(availableHeight - galleryHeight, availableHeight * 0.5);
    
    gallery.style.height = galleryHeight + 'px';
    
    const info = document.querySelector('.quick-view__info');
    if (info) {
      info.style.maxHeight = remainingHeight + 'px';
    }
  }
}

// Function to initialize modal with proper sizing
function initQuickViewModal(productId, formId) {
  // Set initial modal height
  setModalHeightFromGallery();
  
  // Initialize existing quick view functionality
  if (typeof initQuickView === 'function') {
    initQuickView(productId, formId);
  }
  
  // Initialize splide after sizing
  setTimeout(() => {
    const splideElement = document.querySelector(`#quickview-splide-${productId}`);
    if (splideElement && typeof Splide !== 'undefined') {
      new Splide(splideElement, {
        type: 'fade',
        pagination: true,
        arrows: true,
        autoHeight: false, // We're controlling height manually
        cover: true,
      }).mount();
    }
  }, 100);
}

// Responsive handler
function handleModalResize() {
  const modal = document.querySelector('.quickview-modal');
  if (modal && modal.style.display !== 'none') {
    setModalHeightFromGallery();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleModalResize, 250);
  });
  
  // Handle orientation change on mobile
  window.addEventListener('orientationchange', function() {
    setTimeout(handleModalResize, 300);
  });
});

// Example usage when opening modal
function openQuickView(productId, formId) {
  // Show modal first
  const modal = document.querySelector('.quickview-modal');
  if (modal) {
    modal.style.display = 'flex';
    
    // Initialize with proper sizing
    initQuickViewModal(productId, formId);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
}

// Example usage when closing modal
function closeQuickView() {
  const modal = document.querySelector('.quickview-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Auto-detect product type and set appropriate aspect ratio
function setProductAspectRatio(productType, gallery) {
  if (!gallery) return;
  
  // Remove existing aspect ratio classes
  gallery.classList.remove('square-aspect', 'tall-aspect', 'wide-aspect');
  
  // Set based on product type or tags
  switch(productType?.toLowerCase()) {
    case 'clothing':
    case 'fashion':
    case 'apparel':
      gallery.classList.add('tall-aspect');
      break;
    case 'jewelry':
    case 'accessories':
      gallery.classList.add('square-aspect');
      break;
    case 'electronics':
    case 'furniture':
      gallery.classList.add('wide-aspect');
      break;
    default:
      // Keep default 4:3 aspect ratio
      break;
  }
}

// Enhanced initialization with product type detection
function initQuickViewWithProductType(productId, formId, productType = null) {
  const gallery = document.querySelector('.quick-view__gallery');
  
  if (productType && gallery) {
    setProductAspectRatio(productType, gallery);
  }
  
  initQuickViewModal(productId, formId);
}