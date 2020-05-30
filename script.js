/**
 * User data:
 * input selector
 * input threshold
 * input transition
 * input scroll (both ways - only scrolling down - only scrolling up)
 * input duration
 * input delay
 * input once
 */

 /**
  * Private functions
  * default options
  * replace with user options
  * assign transition
  * unobserve if it is called only once
  * method to get item being called
  * method to get if screen is scrolling direction
  */

/**
 * Options for the intersection observer API
 * 
 * More information at: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
 * 
 * @param {Element} root object whose bounding box is used as the bounds of the viewport 
 * @param {string} rootMargin offsets for one or more sides of the root's bounding box.
 * @param {number} threshold list or value of intersection thresholds for the observer
 * @returns {object} with the defined or default options
 */
const setOptions = ({
  root = null,
  rootMargin = '0px',
  threshold = 1
} = {}) => ({
  root,
  rootMargin,
  threshold
});

/**
 * This function initializes a scrolling direction tracker
 */
let withScrollingDirection = () => {
  let currentY = window.scrollY;
  let previousY = 0;

  let isDownwards = () => currentY > previousY;
  
  let updatePosition = () => {
    previousY = currentY;
    currentY = window.scrollY;
  };

  let isScrollingDown = () => {
    updatePosition();
    return isDownwards();
  }
  return {
    isScrollingDown: isScrollingDown,
    updatePosition: updatePosition
  }
}

let track = withScrollingDirection();

let intersectionEffect = (entries) => { 
  //console.log('entries', entries);
  console.log(track.isScrollingDown());
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      //entry.target.classList.add("effect");
      entry.target.style.opacity = "1";
      entry.target.style.animation = "fadeIn ease 2s";
      console.log(entry,'bhsjhbjsd');
      //console.log('scrollingDown', scrollingDown)
    }
  });
};

let createObserver = ({selector, options}) => {
  let selectItems = document.querySelectorAll(selector);
  let observer = new IntersectionObserver(intersectionEffect, setOptions(options));
  return {
    init: () => {
      selectItems.forEach(t => observer.observe(t));
    }
  }
} 

createObserver({selector: '.item'}).init();