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
  $('.gifplayer');
$('.gifplayer').gifplayer();

$gifs = $('.gif');

$gifs.each(function (i, gif) {
    $(gif).data('isPlaying', false);
});


$(window).scroll(function () {
    $gifs = $('.gif');

    $gifs.each(function (i, gif) {
        $gif = $(gif);

        if ($gif.visible(true)) {
            if (!$gif.data('isPlaying')) {
                $gif.find('.gifplayer').gifplayer('play');
                $gif.data('isPlaying', true);
            }

            if ($gif.find('.gp-gif-element').length > 1) {
                $gif.find('.gp-gif-element').first().remove();
            }
        } else {
            if ($gif.data('isPlaying')) {
                $gif.find('.gifplayer').gifplayer('stop');
                $gif.data('isPlaying', false);
            }
        }
    });
});

  // Color cycling functionality
  document.addEventListener('DOMContentLoaded', function() {
    var colors = ['#ff3258', '#ff4545', '#32a8a8', '#8A2BE2'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--pink', randomColor);
  });