import type { Game } from './game';
export type TournamentKind = 'masters' | 'kel';
export type TournamentRound = {round:number;pick:string;place:number;checkpoint:boolean;eligible:boolean;banned:string[]};
export type TournamentResult = { kind:TournamentKind; champion:string; playerPlace:number; circuitPoints:number; rounds:TournamentRound[]; note:string };
const pool=['아야','현우','유키','재키','리오','하트','매그너스','쇼이치','타지아','이바','엘레나','피오라','혜진','아드리아나','키아라','루크','수아','시셀라','캐시','나딘','알렉스','로지','니키','아이작'];
const clamp=(n:number)=>Math.max(1,Math.min(8,Math.round(n)));
const power=(g:Game)=>{const roster=(g.teamMembers??[]).filter(member=>member.starter);const teamBonus=roster.length?roster.reduce((sum,member)=>sum+member.skill+member.form-member.fatigue*.5,0)/roster.length*.08:0;return (g.stats.physical+g.stats.combat+g.stats.macro+g.stats.judgement+g.stats.teamwork+g.stats.focus)/6+(g.mastery[g.main]??0)*.15-g.fatigue*.18+teamBonus;};
const checkpointCount=(round:number)=>round<5?0:round===5?2:round===6?3:round===7?5:round===8?7:8;
const banDuration=(picked:number)=>picked>=5?3:picked===4?2:picked===3?1:0;
/** Masters: a lobby-wide 3-Pick-Ban simulation. KEL: a per-team 2-PICK-CAP simulation. */
export function simulateTournament(g:Game, kind:TournamentKind):TournamentResult {
 const rounds:TournamentRound[]=[]; const used:Record<string,number>={}; const bans:Record<string,number>={}; let playerPlace=8; let champion='루미아 라이벌'; const total=kind==='masters'?4:9;
 for(let round=1;round<=total;round++){
   const activeBans=kind==='masters'?Object.keys(bans).filter(x=>bans[x]>0):[];
   const usable=kind==='kel'?pool.filter(x=>(used[x]??0)<2):pool.filter(x=>!activeBans.includes(x));
   const fallback=usable[round%usable.length]??(kind==='masters'?pool.find(x=>!activeBans.includes(x))!:pool[round%pool.length]);
   const pick=kind==='kel'?(usable.includes(g.main)?g.main:fallback):(usable.includes(g.main)?g.main:fallback);
   if(kind==='kel')used[pick]=(used[pick]??0)+1;
   const place=clamp(9-(power(g)+(Math.random()-.5)*30)/13);
   const eligible=kind==='kel'&&round>=5&&place<=checkpointCount(round);
   rounds.push({round,pick,place,checkpoint:kind==='kel'&&round>=5,eligible,banned:activeBans});
   if(kind==='masters'){
     for(const character of Object.keys(bans)) bans[character]=Math.max(0,bans[character]-1);
     const lobbyPicks=[pick,...Array.from({length:23},(_,i)=>pool[(round+i+(Math.random()<.55?pool.indexOf(pick):0))%pool.length])];
     const counts=lobbyPicks.reduce<Record<string,number>>((all,character)=>{all[character]=(all[character]??0)+1;return all;},{});
     for(const [character,count] of Object.entries(counts)){const duration=banDuration(count);if(duration)bans[character]=Math.max(bans[character]??0,duration);}
   }
   playerPlace=Math.min(playerPlace,place); if(kind==='kel'&&eligible&&place===1){champion=g.name;break;}
 }
 if(kind==='masters')champion=playerPlace<=2?g.name:'루미아 라이벌'; if(kind==='kel'&&champion!==g.name)champion='루미아 라이벌'; const circuitPoints=playerPlace===1?400:playerPlace===2?345:playerPlace===3?290:playerPlace===4?245:200;
 return {kind,champion,playerPlace,circuitPoints,rounds,note:kind==='masters'?'마스터즈: 3픽밴을 적용합니다. 한 라운드에서 같은 실험체가 3명 선택되면 다음 1R, 4명이면 다음 2R, 5명 이상이면 다음 3R 동안 모든 팀이 사용할 수 없습니다.':'KEL 결승: 4R까지 체크포인트 없음, 5R부터 순차 부여합니다. KEL에만 2-PICK-CAP을 적용해 같은 실험체를 세 번째 선택할 수 없습니다.'};
}
