document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('quickview-modal');
  const content = modal.querySelector('.quickview-content');
  const loader = document.getElementById('quickview-loader');

  document.addEventListener('click', function (e) {
    const icon = e.target.closest('.quickview-icon');
    const closeBtn = e.target.closest('.quickview-close');

    if (icon) {
      const handle = icon.getAttribute('data-product-handle');
      const url = `/products/${handle}?section_id=product-quick-view`;

      loader.style.display = 'block';
      openQuickView();

      fetch(url)
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;
          loader.style.display = 'none';

          const scripts = content.querySelectorAll('script');
          scripts.forEach(script => {
            if (script.innerHTML.trim()) {
              try {
                const newScript = document.createElement('script');
                newScript.innerHTML = script.innerHTML;
                document.head.appendChild(newScript);
                document.head.removeChild(newScript);
              } catch (error) {
              }
            }
          });

          const splideEl = content.querySelector('.splide');
          if (splideEl) {
            new Splide(splideEl, {
              type: 'loop',
              perPage: 1,
              pagination: true,
              arrows: true,
            }).mount();
          }

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
              
              const initQuickViewInline = function(productId, productFormId) {
                const form = document.querySelector('#' + productFormId);
                if (!form) return;

                const variantButtons = form.querySelectorAll('.variant-button');
                const variants = window['variants_' + productId];

                if (!variants || variantButtons.length === 0) return;

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

                function updateAvailability() {
                  const selectedOptions = getCurrentOptions();
                  
                  form.querySelectorAll('.variant-buttons-grid').forEach((group, optionIndex) => {
                    const buttons = group.querySelectorAll('.variant-button');
                    
                    buttons.forEach(button => {
                      const testOptions = [...selectedOptions];
                      testOptions[optionIndex] = button.getAttribute('data-value');
                      
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

                function updateVariant() {
                  const selectedOptions = getCurrentOptions();

                  const variant = variants.find(v =>
                    v.options.every((opt, i) => opt.trim() === selectedOptions[i]?.trim())
                  );

                  if (variant) {
                    const hiddenInput = form.querySelector('input[name="id"]');
                    if (hiddenInput) hiddenInput.value = variant.id;

                    const priceEl = form.querySelector('.price-wrapper .price');
                    if (priceEl) priceEl.innerHTML = variant.price_formatted;

                    const compareEl = form.querySelector('.compare-price');
                    if (compareEl) {
                      if (variant.compare_at_price > variant.price) {
                        compareEl.innerHTML = variant.compare_at_price_formatted;
                        compareEl.style.display = 'inline';
                      } else {
                        compareEl.style.display = 'none';
                      }
                    }

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
                  
                  updateAvailability();
                }

                variantButtons.forEach(button => {
                  button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.disabled) return;
                    
                    const siblings = this.parentElement.querySelectorAll('.variant-button');
                    siblings.forEach(sibling => sibling.classList.remove('selected'));
                    
                    this.classList.add('selected');

                    const optionGroup = this.closest('.variant-option');
                    const selectedValueSpan = optionGroup.querySelector('.selected-value');
                    if (selectedValueSpan) {
                      selectedValueSpan.textContent = this.getAttribute('data-value');
                    }
                    
                    updateVariant();
                  });
                });

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

    if (closeBtn) {
      closeQuickView();
      content.innerHTML = '';
    }

    if (e.target === modal) {
      closeQuickView();
      content.innerHTML = '';
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  
  function updateWishlistButtonText() {
    document.querySelectorAll('.wishlist-engine.wishlist-button-styled').forEach(function(button) {
      const textEl = button.querySelector('.wishlist-text');
      if (!textEl) return;
      
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
  
  updateWishlistButtonText();
  
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
  
  document.querySelectorAll('.wishlist-engine').forEach(function(button) {
    observer.observe(button, {
      attributes: true,
      attributeFilter: ['class']
    });
  });
  
  let originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(function(response) {
      setTimeout(updateWishlistButtonText, 100);
      return response;
    });
  };
  
  let originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      setTimeout(updateWishlistButtonText, 100);
    });
    return originalOpen.apply(this, arguments);
  };
  
});

document.addEventListener('click', function(e) {
  const wishlistEngine = e.target.closest('.wishlist-engine.wishlist-button-styled');
  if (wishlistEngine) {
    wishlistEngine.style.transform = 'scale(0.95)';
    setTimeout(() => {
      wishlistEngine.style.transform = '';
    }, 150);
  }
});

document.addEventListener('mouseenter', function(e) {
  const wishlistEngine = e.target.closest('.wishlist-engine.wishlist-button-styled');
  if (wishlistEngine && wishlistEngine.hasAttribute('data-tooltip')) {
    const tooltip = wishlistEngine.getAttribute('data-tooltip');
    
    const existingTooltip = document.querySelector('.custom-wishlist-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
    
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
    
    const rect = wishlistEngine.getBoundingClientRect();
    tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
    tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 8 + 'px';
    
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

function setModalHeightFromGallery() {
  const modal = document.querySelector('.quickview-modal');
  const content = document.querySelector('.quickview-content');
  const gallery = document.querySelector('.quick-view__gallery');
  
  if (!modal || !content || !gallery) return;
  
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  const availableHeight = viewportHeight - 40;
  const availableWidth = viewportWidth - 40;
  
  let idealWidth = Math.min(980, availableWidth);
  
  let galleryWidth = idealWidth * 0.58333;
  
  let aspectRatio = 4/3;
  
  if (viewportWidth <= 768) {
    aspectRatio = 16/10;
  }
  
  if (gallery.classList.contains('square-aspect')) {
    aspectRatio = 1/1;
  } else if (gallery.classList.contains('tall-aspect')) {
    aspectRatio = 3/4;
  } else if (gallery.classList.contains('wide-aspect')) {
    aspectRatio = 16/9;
  }
  
  let idealHeight = galleryWidth / aspectRatio;
  
  const minInfoHeight = 300;
  idealHeight = Math.max(idealHeight, minInfoHeight);
  
  idealHeight = Math.min(idealHeight, availableHeight);
  
  content.style.height = idealHeight + 'px';
  content.style.width = idealWidth + 'px';
  
  if (viewportWidth <= 768) {
    const galleryHeight = galleryWidth / aspectRatio;
    const remainingHeight = Math.min(availableHeight - galleryHeight, availableHeight * 0.5);
    
    gallery.style.height = galleryHeight + 'px';
    
    const info = document.querySelector('.quick-view__info');
    if (info) {
      info.style.maxHeight = remainingHeight + 'px';
    }
  }
}

function initQuickViewModal(productId, formId) {
  setModalHeightFromGallery();
  
  if (typeof initQuickView === 'function') {
    initQuickView(productId, formId);
  }
  
  setTimeout(() => {
    const splideElement = document.querySelector(`#quickview-splide-${productId}`);
    if (splideElement && typeof Splide !== 'undefined') {
      new Splide(splideElement, {
        type: 'fade',
        perPage: 1,
        perMove: 1,
        pagination: true,
        arrows: true,
        autoHeight: true,
        cover: true,
      }).mount();
    }
  }, 100);
}

function handleModalResize() {
  const modal = document.querySelector('.quickview-modal');
  if (modal && modal.style.display !== 'none') {
    setModalHeightFromGallery();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleModalResize, 250);
  });
  
  window.addEventListener('orientationchange', function() {
    setTimeout(handleModalResize, 300);
  });
});

function openQuickView(productId, formId) {
  const modal = document.querySelector('.quickview-modal');
  if (modal) {
    modal.style.display = 'flex';
    
    initQuickViewModal(productId, formId);
    
    document.body.style.overflow = 'hidden';
  }
}

function closeQuickView() {
  const modal = document.querySelector('.quickview-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function setProductAspectRatio(productType, gallery) {
  if (!gallery) return;
  
  gallery.classList.remove('square-aspect', 'tall-aspect', 'wide-aspect');
  
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
      break;
  }
}

function initQuickViewWithProductType(productId, formId, productType = null) {
  const gallery = document.querySelector('.quick-view__gallery');
  
  if (productType && gallery) {
    setProductAspectRatio(productType, gallery);
  }
  
  initQuickViewModal(productId, formId);
}