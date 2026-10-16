import type {Noun} from './engine';
const paths:Record<Noun,string>={
 MOTH:'<path d="M23 25C4 6 3 36 22 33M25 25C44 6 45 36 26 33" fill="currentColor"/><path d="M24 17v21m-1-20-5-6m7 6 5-6" stroke="#efedd7" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="#efedd7"/>',
 SEED:'<path d="M24 39C3 30 13 14 24 24c11-10 21 6 0 15" fill="currentColor"/><path d="M24 26V12m0 6c-10 0-11-8-11-8 10-1 11 8 11 8m0-2c8 0 11-9 11-9-10 0-11 9-11 9" fill="currentColor" stroke="currentColor" stroke-width="2"/>',
 CRATE:'<rect x="9" y="10" width="30" height="29" rx="5" fill="none" stroke="currentColor" stroke-width="4"/><path d="m12 13 24 23m0-23L12 36" stroke="currentColor" stroke-width="3"/>',
 WALL:'<path d="M7 14h34v23H7zM7 25h34M24 14v11M16 25v12m17-12v12" fill="none" stroke="currentColor" stroke-width="3"/>',
 BEACON:'<path d="m24 5 4 10 11 4-11 5-4 11-4-11-11-5 11-4z" fill="currentColor"/><path d="M15 39h18m-15-5h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
 POND:'<path d="M6 19q5-6 10 0t10 0 10 0 7 0M6 28q5-6 10 0t10 0 10 0 7 0M10 37q5-6 10 0t10 0 10 0" fill="none" stroke="currentColor" stroke-width="3"/>',
 EMBER:'<path d="M25 6c5 12 15 15 12 25-4 16-29 13-27-2 1-7 8-11 10-16 0 7 3 8 4 11 4-6 0-12 1-18" fill="currentColor"/><path d="M25 25c10 13-7 17-7 8 0-3 5-5 7-8" fill="#f6d6a2"/>'
};
export const art=(noun:Noun)=>`<svg viewBox="0 0 48 48" aria-hidden="true">${paths[noun]}</svg>`;
