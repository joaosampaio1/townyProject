//https://www.youtube.com/watch?v=ThSaI0kuez8

const navLinkEls = document.querySelectorAll('.boxTop');
const windowPathname = window.location.pathname;
navLinkEls.forEach(element => {
    const nlp = new URL(element.href).pathname;
    //console.log(nlp);
   if ((windowPathname === nlp) || windowPathname==="/index.html" && nlp === '/') {
    element.classList.add('active');
   }
});