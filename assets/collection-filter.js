
  document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('[data-toggle-filter]');
    const filterPanel = document.querySelector('[data-filter-panel]');
    if (toggleBtn && filterPanel) {
      toggleBtn.addEventListener('click', function() {
        filterPanel.classList.toggle('open');
      });
    }
    const minInput = document.getElementById('min-range');
    initializeFilterState();
  });

  function initializeFilterState() {
    const urlParams = new URLSearchParams(window.location.search);
    const pathSegments = window.location.pathname.split('/');
    let currentTags = [];
    
    // Get current vendor from URL
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
    
    // Toggle tag
    if (isActive) {
      currentTags = currentTags.filter(t => t.toLowerCase() !== tag.toLowerCase());
    } else {
      currentTags.push(tag);
    }
    
    // Build URL
    let newUrl = baseUrl;
    if (currentTags.length > 0) {
      newUrl += '/' + currentTags.join('+');
    }
    
    // Keep vendor filter
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
    
    // Toggle tag
    if (checkbox.checked) {
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
      }
    } else {
      currentTags = currentTags.filter(t => t !== tag);
    }
    
    // Build URL
    let newUrl = baseUrl;
    if (currentTags.length > 0) {
      newUrl += '/' + currentTags.join('+');
    }
    
    // Keep vendor filter
    if (urlParams.has('filter.v.vendor')) {
      newUrl += '?filter.v.vendor=' + encodeURIComponent(urlParams.get('filter.v.vendor'));
    }
    
    window.location.href = newUrl;
  }

  function handleVendorFilter(checkbox) {
    const vendor = checkbox.getAttribute('data-vendor');
    const urlParams = new URLSearchParams(window.location.search);
    
    if (checkbox.checked) {
      // Uncheck other vendor checkboxes
      document.querySelectorAll('input[type="checkbox"][data-vendor]').forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
      });
      
      // Set vendor filter
      urlParams.set('filter.v.vendor', vendor);
    } else {
      // Remove vendor filter
      urlParams.delete('filter.v.vendor');
    }
    
    // Build URL
    let newUrl = window.location.pathname;
    const queryString = urlParams.toString();
    if (queryString) {
      newUrl += '?' + queryString;
    }
    
    window.location.href = newUrl;
  }