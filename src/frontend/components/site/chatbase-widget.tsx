"use client";
// Chatbase AI chat bubble for the public marketing pages. The snippet is Chatbase's embed code, kept exactly
// as they supply it; the id inside it identifies our agent. The snippet itself waits for the page's load
// event before fetching Chatbase, so it runs early to have its command queue ready. On wide screens the
// chat opens itself once per visit, a few seconds in.
import Script from "next/script";
import { useEffect } from "react";

const CHATBASE_EMBED = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="Kuqg51liWizcdRHp3ovo_";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;

const AUTO_OPEN_DELAY_MS = 5000;
const AUTO_OPEN_KEY = "reynav.chat.autoOpened";
// On phones the open chat covers the whole screen, so it waits to be tapped instead.
const AUTO_OPEN_MEDIA = "(min-width: 768px)";

// Element ids and the phone breakpoint (640px) come from Chatbase's widget; the sizes live in globals.css.
const CHAT_WINDOW_ID = "chatbase-bubble-window";
const BUBBLE_BUTTON_ID = "chatbase-bubble-button";
const MINIMISE_MEDIA = "(min-width: 640px)";
const MINIMISE_SCROLL_PX = 120;
const MINIMISED_CLASS = "reynav-chat-minimised";

declare global {
  interface Window {
    chatbase?: (command: string, ...args: unknown[]) => unknown;
  }
}

function hasAutoOpened(): boolean {
  try {
    return window.sessionStorage.getItem(AUTO_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markAutoOpened(): void {
  try {
    window.sessionStorage.setItem(AUTO_OPEN_KEY, "1");
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the chat may then reopen per page.
  }
}

export function ChatbaseWidget() {
  useEffect(() => {
    if (hasAutoOpened() || !window.matchMedia(AUTO_OPEN_MEDIA).matches) return;
    const timer = window.setTimeout(() => {
      // Queued by the embed stub if Chatbase has not finished loading yet.
      window.chatbase?.("open");
      markAutoOpened();
    }, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Scrolling on through the page while the chat is open tucks it back into the bubble, which then pulses
    // so the visitor knows the conversation is still there. Desktop only: phones show the chat full screen.
    let anchorY: number | null = null;
    let frame = 0;

    const check = () => {
      frame = 0;
      const chatWindow = document.getElementById(CHAT_WINDOW_ID);
      const isOpen = !!chatWindow && chatWindow.style.display !== "none";
      if (!isOpen || !window.matchMedia(MINIMISE_MEDIA).matches) {
        anchorY = null;
        return;
      }
      anchorY ??= window.scrollY;
      if (window.scrollY - anchorY > MINIMISE_SCROLL_PX) {
        window.chatbase?.("close");
        document.documentElement.classList.add(MINIMISED_CLASS);
        anchorY = null;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    // Reopening from the bubble ends the pulse.
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(`#${BUBBLE_BUTTON_ID}`)) {
        document.documentElement.classList.remove(MINIMISED_CLASS);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove(MINIMISED_CLASS);
    };
  }, []);

  return <Script id="chatbase-embed" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: CHATBASE_EMBED }} />;
}
