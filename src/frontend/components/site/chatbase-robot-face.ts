// A robot face laid over the Chatbase chat bubble whose eyes follow the pointer around the page. The bubble
// lives outside React, so the face is plain DOM added inside Chatbase's button, next to (not inside) the icon
// holder that Chatbase rewrites on open and close. Clicks pass straight through to the real button.
const BUBBLE_BUTTON_ID = "chatbase-bubble-button";
const FACE_CLASS = "reynav-bot";
const CHECK_INTERVAL_MS = 500;

// Positions in the face's 48×48 viewBox.
const VIEWBOX = 48;
const EYES = [
  { cx: 19, cy: 23 },
  { cx: 29, cy: 23 },
];
const PUPIL_TRAVEL = 1.7;
const HEAD_TRAVEL = 0.8;
// Pointer distance (px) at which the pupils reach their full travel.
const FULL_LOOK_PX = 160;

const FACE_SVG = `
<svg viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" aria-hidden="true" focusable="false">
  <g class="${FACE_CLASS}-head">
    <line x1="24" y1="9.5" x2="24" y2="13" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
    <circle class="${FACE_CLASS}-bulb" cx="24" cy="8.5" r="2"/>
    <rect x="7.5" y="20" width="3" height="7" rx="1.5" fill="#ffffff"/>
    <rect x="37.5" y="20" width="3" height="7" rx="1.5" fill="#ffffff"/>
    <rect x="10" y="13" width="28" height="23" rx="7" fill="#ffffff"/>
    <rect x="13" y="17" width="22" height="12" rx="6" fill="#111624"/>
    <g class="${FACE_CLASS}-eyes">
      ${EYES.map(
        ({ cx, cy }) =>
          `<circle cx="${cx}" cy="${cy}" r="3.4" fill="#ffffff"/>` +
          `<circle class="${FACE_CLASS}-pupil" cx="${cx}" cy="${cy}" r="1.7" fill="#d4557a"/>`,
      ).join("")}
    </g>
    <path class="${FACE_CLASS}-smile" d="M20.5 31.5q3.5 2.4 7 0" fill="none" stroke="#d4557a" stroke-width="1.6" stroke-linecap="round"/>
    <g class="${FACE_CLASS}-happy">
      <path d="M15.8 24.2q3.2-4 6.4 0M25.8 24.2q3.2-4 6.4 0" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M19.5 30.5q4.5 4.8 9 0z" fill="#d4557a" stroke="#d4557a" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="14.5" cy="31.5" r="1.8" fill="#f5a3bb"/>
      <circle cx="33.5" cy="31.5" r="1.8" fill="#f5a3bb"/>
    </g>
  </g>
</svg>`;

function createFace(): HTMLSpanElement {
  const face = document.createElement("span");
  face.className = FACE_CLASS;
  face.setAttribute("aria-hidden", "true");
  face.innerHTML = FACE_SVG;
  return face;
}

// Adds the face to the bubble once Chatbase has drawn it (and again if Chatbase ever rebuilds the button).
// Returns a cleanup that removes the face and its listeners.
export function mountRobotFace(): () => void {
  let face: HTMLSpanElement | null = null;
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;

  const ensureFace = () => {
    const button = document.getElementById(BUBBLE_BUTTON_ID);
    if (!button || (face && button.contains(face))) return;
    face = createFace();
    button.appendChild(face);
    schedule();
  };

  const render = () => {
    frame = 0;
    const svg = face?.querySelector("svg");
    if (!face || !svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const scale = rect.width / VIEWBOX;

    const offsetToward = (cx: number, cy: number, travel: number) => {
      if (!pointer) return { x: 0, y: 0 };
      const dx = pointer.x - (rect.left + cx * scale);
      const dy = pointer.y - (rect.top + cy * scale);
      const distance = Math.hypot(dx, dy);
      if (!distance) return { x: 0, y: 0 };
      const reach = travel * Math.min(1, distance / FULL_LOOK_PX);
      return { x: (dx / distance) * reach, y: (dy / distance) * reach };
    };

    face.querySelectorAll<SVGCircleElement>(`.${FACE_CLASS}-pupil`).forEach((pupil, i) => {
      const { x, y } = offsetToward(EYES[i].cx, EYES[i].cy, PUPIL_TRAVEL);
      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
    const head = face.querySelector<SVGGElement>(`.${FACE_CLASS}-head`);
    const tilt = offsetToward(VIEWBOX / 2, VIEWBOX / 2, HEAD_TRAVEL);
    if (head) head.style.transform = `translate(${tilt.x}px, ${tilt.y}px)`;
  };

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  const onPointerMove = (event: PointerEvent) => {
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  };
  // Leaving the window sends the gaze back to the middle.
  const onPointerLeave = () => {
    pointer = null;
    schedule();
  };

  ensureFace();
  const timer = window.setInterval(ensureFace, CHECK_INTERVAL_MS);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.cancelAnimationFrame(frame);
    face?.remove();
  };
}
