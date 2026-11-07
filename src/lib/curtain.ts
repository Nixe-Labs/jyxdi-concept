/** Runs before first paint (inline in the layout), so it runs on every full load of a page but never on a navigation
    inside the site: on the homepage, with no deep link and no reduced motion, html.is-curtain raises the opening and
    holds the hero's entrance, so nothing flashes. sessionStorage jx-no-intro=1 skips it (the automated checks use it).
    If the page's own code hasn't arrived after 7s, the opening steps aside. */
export const curtainScript = (base: string) => `try{var p=location.pathname.replace(/\\/$/,""),h=document.documentElement;if(p===${JSON.stringify(base)}&&!location.hash&&sessionStorage.getItem("jx-no-intro")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){h.classList.add("is-curtain");setTimeout(function(){if(!h.classList.contains("curtain-js"))h.classList.remove("is-curtain")},7000)}}catch(e){}`;
