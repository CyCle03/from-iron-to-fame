export type Rank = '아이언'|'브론즈'|'실버'|'골드'|'플래티넘'|'다이아몬드'|'미스릴'|'데미갓'|'이터니티';
export type Background = '일반 유저'|'피지컬 괴물'|'이론 분석가'|'원챔 장인'|'아마추어 경험자'|'복귀 유망주';
export type Action = 'rank'|'physical'|'macro'|'specialist'|'review'|'team'|'rest';
export type Stats = { physical:number; combat:number; macro:number; judgement:number; teamwork:number; mental:number; focus:number; adaptability:number };
export type Game = { version:1; name:string; rank:Rank; rp:number; week:number; season:number; background:Background; main:string; stats:Stats; fatigue:number; morale:number; mastery:Record<string,number>; actionPoints:number; history:string[]; matches:{place:number;kills:number;rp:number;name:string}[]; notices:string[] };
export const ranks: Rank[]=['아이언','브론즈','실버','골드','플래티넘','다이아몬드','미스릴','데미갓','이터니티'];
export const backgrounds: Record<Background,{desc:string; buffs:Partial<Stats>}>={
 '일반 유저':{desc:'고른 출발선. 어떤 길이든 열려 있습니다.',buffs:{}},'피지컬 괴물':{desc:'교전은 자신 있지만 콜은 아직 거칩니다.',buffs:{physical:10,combat:8,macro:-5,teamwork:-4}},'이론 분석가':{desc:'판은 읽지만 손이 조금 느립니다.',buffs:{macro:10,judgement:8,physical:-5,combat:-4}},'원챔 장인':{desc:'주력 실험체와 함께라면 무섭습니다.',buffs:{combat:5,adaptability:-7}},'아마추어 경험자':{desc:'대회장의 호흡을 이미 압니다.',buffs:{teamwork:9,mental:5}},'복귀 유망주':{desc:'감각은 남아 있지만 메타는 새롭습니다.',buffs:{focus:7,adaptability:-5}}
};
export const characters=['아야','현우','유키','재키','리오','하트','매그너스','쇼이치'];
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
const rankFor=(rp:number):Rank=>ranks[Math.min(8,Math.max(0,Math.floor(rp/500)))];
export function createGame(name:string, rank:Rank, background:Background, main:string):Game { const base=38+ranks.indexOf(rank)*5; const stats={physical:base,combat:base,macro:base,judgement:base,teamwork:base,mental:base,focus:base,adaptability:base}; for(const [k,v] of Object.entries(backgrounds[background].buffs)) stats[k as keyof Stats]=clamp(stats[k as keyof Stats]+(v??0)); const rp=ranks.indexOf(rank)*500+120; return {version:1,name,rank,rp,week:1,season:11,background,main,stats,fatigue:12,morale:58,mastery:{[main]:28},actionPoints:3,history:['루미아 섬에 새로운 선수가 도착했습니다.'],matches:[],notices:['시즌 11 MVP: 랭크·훈련·휴식을 조합해 당신만의 커리어를 시작하세요.']}; }
export function act(g:Game,a:Action):Game { if(g.actionPoints<1) return {...g,notices:['이번 주 행동력이 없습니다. 주를 넘겨주세요.']}; const n=structuredClone(g); n.actionPoints--; const s=n.stats; const gain=(key:keyof Stats,amount:number)=>s[key]=clamp(s[key]+amount*(1-s[key]/140)); const log=(t:string)=>n.history.unshift(`S${n.season} ${n.week}주 · ${t}`);
 if(a==='rest'){n.fatigue=clamp(n.fatigue-24);n.morale=clamp(n.morale+8);log('휴식으로 컨디션을 회복했습니다.');}
 if(a==='physical'){gain('physical',3);gain('combat',2);n.fatigue+=12;log('피지컬 훈련: 손끝 감각이 날카로워졌습니다.');}
 if(a==='macro'){gain('macro',3);gain('judgement',2);n.fatigue+=9;log('리플레이 분석: 다음 동선이 보이기 시작합니다.');}
 if(a==='specialist'){n.mastery[n.main]=clamp((n.mastery[n.main]??0)+7);gain('focus',1);n.fatigue+=11;log(`${n.main} 집중 연습: 숙련도가 올랐습니다.`);}
 if(a==='review'){gain('adaptability',2);gain('mental',2);n.fatigue+=5;log('리플레이 분석: 실수를 다음 판의 무기로 바꿨습니다.');}
 if(a==='team'){gain('teamwork',3);n.morale=clamp(n.morale+3);n.fatigue+=9;log('합동 연습: 팀원과 호흡이 맞아갑니다.');}
 if(a==='rank'){const power=(s.physical+s.combat+s.macro+s.judgement+s.teamwork+s.focus)/6+(n.mastery[n.main]??0)*.18-n.fatigue*.28+(Math.random()-.5)*24; const place=clamp(Math.round(20-power/7)); const kills=Math.max(0,Math.round((power-36)/19+Math.random()*3)); const delta=Math.round((11-place)*4+kills*3+(Math.random()-.5)*10); n.rp=Math.max(0,n.rp+delta);n.rank=rankFor(n.rp);n.fatigue=clamp(n.fatigue+16);n.morale=clamp(n.morale+(delta>=0?3:-4));n.mastery[n.main]=clamp((n.mastery[n.main]??0)+3);n.matches.unshift({place,kills,rp:delta,name:n.main});log(`랭크 경기 ${place}위 · ${kills}킬 · RP ${delta>=0?'+':''}${delta}`);}
 n.fatigue=clamp(n.fatigue); return n; }
export function nextWeek(g:Game):Game {const n=structuredClone(g);n.week++;if(n.week>12){n.week=1;n.season++;n.notices=[`시즌 ${n.season}이 시작되었습니다. 메타가 조금 흔들립니다.`];}else {const e=n.fatigue>75?'피로가 누적되었습니다. 휴식도 성장의 일부입니다.':Math.random()>.75?'스카우트가 최근 경기 기록을 주목합니다.':'다음 대회까지 랭크와 연습으로 기반을 다져보세요.';n.notices=[e];}n.actionPoints=3;n.fatigue=clamp(n.fatigue-5);return n;}
