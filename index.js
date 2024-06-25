/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

 const handleFirstTab = (e) => {
    if(e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing')
  
      window.removeEventListener('keydown', handleFirstTab)
      window.addEventListener('mousedown', handleMouseDownOnce)
    }
  
  }
  
  const handleMouseDownOnce = () => {
    document.body.classList.remove('user-is-tabbing')
  
    window.removeEventListener('mousedown', handleMouseDownOnce)
    window.addEventListener('keydown', handleFirstTab)
  }
  
  window.addEventListener('keydown', handleFirstTab)
  
  const backToTopButton = document.querySelector(".back-to-top");
  let isBackToTopRendered = false;
  
  let alterStyles = (isBackToTopRendered) => {
    backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
    backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
    backToTopButton.style.transform = isBackToTopRendered
      ? "scale(1)"
      : "scale(0)";
  };
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 700) {
      isBackToTopRendered = true;
      alterStyles(isBackToTopRendered);
    } else {
      isBackToTopRendered = false;
      alterStyles(isBackToTopRendered);
    }
  });

  // Color cycling functionality
  document.addEventListener('DOMContentLoaded', function() {
    var colors = ['#ff3258', '#ff4545', '#32a8a8', '#8A2BE2'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--pink', randomColor);
  });

  document.addEventListener('DOMContentLoaded', function() {
    const viewResumeBtn = document.getElementById('viewResumeBtn');
    const pdfPreviewImage = document.getElementById('pdfPreviewImage');
    const pdfViewer = document.getElementById('pdfViewer');
    const closePdfBtn = document.getElementById('closePdfBtn');
  
    function openPdfViewer(e) {
      e.preventDefault();
      pdfViewer.style.display = 'block';
    }
  
    viewResumeBtn.addEventListener('click', openPdfViewer);
    pdfPreviewImage.addEventListener('click', openPdfViewer);
  
    closePdfBtn.addEventListener('click', function() {
      pdfViewer.style.display = 'none';
    });
  
    pdfViewer.addEventListener('click', function(e) {
      if (e.target === pdfViewer) {
        pdfViewer.style.display = 'none';
      }
    });
  });