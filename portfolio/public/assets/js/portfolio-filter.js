/**
 * Handle portfolio filtering from footer links
 */
document.addEventListener('DOMContentLoaded', () => {
  const portfolioFilterLinks = document.querySelectorAll('.portfolio-filter-link');
  
  if (portfolioFilterLinks.length) {
    portfolioFilterLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const filterValue = link.getAttribute('data-filter');
        
        // Scroll to portfolio section
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
          portfolioSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Find and click the corresponding filter button
        setTimeout(() => {
          const filterBtn = document.querySelector(`.portfolio__filter-btn[data-filter="${filterValue}"]`);
          if (filterBtn) {
            filterBtn.click();
          }
        }, 500); // Wait for scrolling to complete
      });
    });
  }
});
