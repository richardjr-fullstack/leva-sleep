document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('[data-toggle-filter]');
    const filterPanel = document.querySelector('[data-filter-panel]');
    if (toggleBtn && filterPanel) {
  toggleBtn.addEventListener('click', function() {
    filterPanel.classList.toggle('open');
    
    // Toggle chevron icons
    const iconDefault = toggleBtn.querySelector('.icon-default');
    const iconClose = toggleBtn.querySelector('.icon-close');
    
    if (filterPanel.classList.contains('open')) {
      // Panel is open - show chevron-down (close icon)
      iconDefault.classList.add('hidden');
      iconClose.classList.remove('hidden');
    } else {
      // Panel is closed - show chevron-up (default icon)
      iconDefault.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  });
}
    
    // Left Filter & Sort Drawer Logic
    const collectionFilterDrawerToggle = document.getElementById('collectionFilterDrawerToggle');
    const collectionFilterDrawer = document.getElementById('collectionFilterDrawer');
    const collectionFilterDrawerClose = document.getElementById('collectionFilterDrawerClose');
    const collectionFilterDrawerOverlay = document.getElementById('collectionFilterDrawerOverlay');

    if (collectionFilterDrawerToggle && collectionFilterDrawer) {
      // Open left drawer
      collectionFilterDrawerToggle.addEventListener('click', function() {
        // Close right drawer if open
        const rightDrawer = document.getElementById('filterDrawer');
        if (rightDrawer && rightDrawer.classList.contains('open')) {
          rightDrawer.classList.remove('open');
          document.body.classList.remove('filter-drawer-open');
        }
        
        collectionFilterDrawer.classList.add('open');
        document.body.classList.add('collection-filter-drawer-open');
      });

      // Close left drawer
      function closeCollectionFilterDrawer() {
        collectionFilterDrawer.classList.remove('open');
        document.body.classList.remove('collection-filter-drawer-open');
      }

      if (collectionFilterDrawerClose) {
        collectionFilterDrawerClose.addEventListener('click', closeCollectionFilterDrawer);
      }

      if (collectionFilterDrawerOverlay) {
        collectionFilterDrawerOverlay.addEventListener('click', closeCollectionFilterDrawer);
      }

      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && collectionFilterDrawer.classList.contains('open')) {
          closeCollectionFilterDrawer();
        }
      });

      // Prevent drawer content clicks from closing the drawer
      const drawerContent = document.querySelector('.collection-filter-drawer__content');
      if (drawerContent) {
        drawerContent.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      }
    }
    
    // Right Filter Drawer Logic
    const filterDrawerToggle = document.getElementById('filterDrawerToggle');
    const filterDrawer = document.getElementById('filterDrawer');
    const filterDrawerClose = document.getElementById('filterDrawerClose');
    const filterDrawerOverlay = document.getElementById('filterDrawerOverlay');

    if (filterDrawerToggle && filterDrawer) {
      // Open right drawer
      filterDrawerToggle.addEventListener('click', function() {
        // Close left drawer if open
        const leftDrawer = document.getElementById('collectionFilterDrawer');
        if (leftDrawer && leftDrawer.classList.contains('open')) {
          leftDrawer.classList.remove('open');
          document.body.classList.remove('collection-filter-drawer-open');
        }
        
        filterDrawer.classList.add('open');
        document.body.classList.add('filter-drawer-open');
      });

      // Close right drawer
      function closeFilterDrawer() {
        filterDrawer.classList.remove('open');
        document.body.classList.remove('filter-drawer-open');
      }

      if (filterDrawerClose) {
        filterDrawerClose.addEventListener('click', closeFilterDrawer);
      }

      if (filterDrawerOverlay) {
        filterDrawerOverlay.addEventListener('click', closeFilterDrawer);
      }

      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && filterDrawer.classList.contains('open')) {
          closeFilterDrawer();
        }
      });

      // Prevent drawer content clicks from closing the drawer
      const rightDrawerContent = document.querySelector('.filter-drawer__content');
      if (rightDrawerContent) {
        rightDrawerContent.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      }
    }

    // Mobile filter options functionality (for left drawer)
    document.querySelectorAll('.mobile-filter-option').forEach(button => {
      button.addEventListener('click', function() {
        const sortBy = this.dataset.sortBy;
        const viewAs = this.dataset.viewAs;
        
        if (sortBy) {
          // Handle sort by change
          const url = new URL(window.location);
          url.searchParams.set('sort_by', sortBy);
          window.location.href = url.toString();
        }
        
        if (viewAs) {
          // Handle view as change
          const url = new URL(window.location);
          url.searchParams.set('view', viewAs);
          window.location.href = url.toString();
        }
      });
    });

    const minInput = document.getElementById('min-range');
    initializeFilterState();
  });

  function initializeFilterState() {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/');
    let currentTags = [];
    
    const currentVendor = urlParams.get('filter.v.vendor');
    
    // Extract tags from URL path
    if (pathSegments.length > 3 && pathSegments[3]) {
      currentTags = pathSegments[3].split('+').map(tag => tag.toLowerCase());
    }
    
    // Set tag-based checkboxes
    document.querySelectorAll('input[type="checkbox"][data-tag]').forEach(checkbox => {
      const tag = checkbox.getAttribute('data-tag');
      checkbox.checked = currentTags.includes(tag.toLowerCase());
    });
    
    // Set vendor checkboxes
    document.querySelectorAll('input[type="checkbox"][data-vendor]').forEach(checkbox => {
      const vendor = checkbox.getAttribute('data-vendor');
      checkbox.checked = currentVendor === vendor;
    });
    
    // Set catalogue button states
    document.querySelectorAll('.catalogue-link').forEach(btn => {
      const tag = btn.getAttribute('data-tag');
      btn.classList.toggle('active', currentTags.includes(tag.toLowerCase()));
    });
  }

  function handleCatalogueFilter(button) {
    const tag = button.getAttribute('data-tag');
    const isActive = button.classList.contains('active');
    
    const pathSegments = window.location.pathname.split('/');
    const baseUrl = pathSegments.slice(0, 3).join('/');
    const urlParams = new URLSearchParams(window.location.search);
    
    let currentTags = [];
    if (pathSegments.length > 3 && pathSegments[3]) {
      currentTags = pathSegments[3].split('+');
    }
    
    if (isActive) {
      currentTags = currentTags.filter(t => t.toLowerCase() !== tag.toLowerCase());
    } else {
      currentTags.push(tag);
    }
    
    let newUrl = baseUrl;
    if (currentTags.length > 0) {
      newUrl += '/' + currentTags.join('+');
    }
    
    if (urlParams.has('filter.v.vendor')) {
      newUrl += '?filter.v.vendor=' + encodeURIComponent(urlParams.get('filter.v.vendor'));
    }
    
    window.location.href = newUrl;
  }

  function handleMultiFilter(checkbox) {
    const tag = checkbox.getAttribute('data-tag');
    
    const pathSegments = window.location.pathname.split('/');
    const baseUrl = pathSegments.slice(0, 3).join('/');
    const urlParams = new URLSearchParams(window.location.search);
    
    let currentTags = [];
    if (pathSegments.length > 3 && pathSegments[3]) {
      currentTags = pathSegments[3].split('+');
    }
    
    if (checkbox.checked) {
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
      }
    } else {
      currentTags = currentTags.filter(t => t !== tag);
    }
    
    let newUrl = baseUrl;
    if (currentTags.length > 0) {
      newUrl += '/' + currentTags.join('+');
    }
    
    if (urlParams.has('filter.v.vendor')) {
      newUrl += '?filter.v.vendor=' + encodeURIComponent(urlParams.get('filter.v.vendor'));
    }
    
    window.location.href = newUrl;
  }

  function handleVendorFilter(checkbox) {
    const vendor = checkbox.getAttribute('data-vendor');
    const urlParams = new URLSearchParams(window.location.search);
    
    if (checkbox.checked) {
      document.querySelectorAll('input[type="checkbox"][data-vendor]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
      });
      
      urlParams.set('filter.v.vendor', vendor);
    } else {
      urlParams.delete('filter.v.vendor');
    }
    
    let newUrl = window.location.pathname;
    const queryString = urlParams.toString();
    if (queryString) {
      newUrl += '?' + queryString;
    }
    
    window.location.href = newUrl;
  }

  function handleUnifiedFilterChange(checkbox) {
    setTimeout(() => {
      const form = checkbox.closest('form');
      if (form) {
        form.submit();
      }
    }, 50);
  }