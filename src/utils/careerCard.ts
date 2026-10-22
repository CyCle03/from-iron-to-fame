import type { Game } from '../engine/game';

const drawText=(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,max=560)=>{
  const words=[...text];let line='';let offset=0;
  for(const char of words){if(ctx.measureText(line+char).width>max&&line){ctx.fillText(line,x,y+offset);line=char;offset+=32}else line+=char}
  if(line)ctx.fillText(line,x,y+offset);
  return offset+32;
};
export function saveCareerCard(game:Game){
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;const ctx=canvas.getContext('2d');if(!ctx)return;
  const bg=ctx.createLinearGradient(0,0,1200,630);bg.addColorStop(0,'#0b1123');bg.addColorStop(.58,'#17274b');bg.addColorStop(1,'#402938');ctx.fillStyle=bg;ctx.fillRect(0,0,1200,630);
  ctx.strokeStyle='rgba(244,189,85,.7)';ctx.lineWidth=2;ctx.strokeRect(28,28,1144,574);ctx.fillStyle='#f4bd55';ctx.fillRect(28,28,8,574);
  ctx.font='700 22px sans-serif';ctx.fillStyle='#f4bd55';ctx.fillText('FROM IRON TO FAME · CAREER RECORD',80,86);
  ctx.font='700 64px sans-serif';ctx.fillStyle='#f6f8ff';ctx.fillText(game.name,80,162);ctx.font='700 28px sans-serif';ctx.fillStyle='#ff8b70';ctx.fillText(`${game.rank} · ${game.rp} RP`,82,207);
  ctx.fillStyle='rgba(12,18,35,.75)';ctx.fillRect(80,250,490,224);ctx.fillStyle='#9eabca';ctx.font='600 20px sans-serif';ctx.fillText('선수 프로필',108,290);ctx.font='700 30px sans-serif';ctx.fillStyle='#f2f5ff';ctx.fillText(`${game.role??'기존 커리어'}  |  ${game.main}`,108,340);ctx.font='500 21px sans-serif';ctx.fillStyle='#cad3eb';ctx.fillText(`주력 숙련도  ${game.mastery[game.main]??0}   ·   시즌 ${game.season} ${game.week}주`,108,388);ctx.fillText(`기록된 랭크 경기  ${game.matches.length}회`,108,430);
  ctx.fillStyle='#f4bd55';ctx.font='700 23px sans-serif';ctx.fillText('주요 성취',650,282);ctx.font='500 22px sans-serif';ctx.fillStyle='#e2e8fa';const best=game.matches.length?Math.min(...game.matches.map(m=>m.place)):null;let y=330;y+=drawText(ctx,`• 최고 랭크: ${game.rank}`,650,y);y+=drawText(ctx,`• ${game.main} 숙련도 ${game.mastery[game.main]??0}`,650,y);y+=drawText(ctx,best?`• 랭크 최고 순위: ${best}위`:'• 아직 첫 랭크 기록을 기다리는 중',650,y);drawText(ctx,`• 누적 커리어 로그: ${game.history.length}개`,650,y);
  ctx.font='500 17px sans-serif';ctx.fillStyle='#9aa9cb';ctx.fillText('게임용 커리어 기록 · 실제 이터널 리턴 선수·대회 기록과 무관합니다.',80,555);ctx.font='700 22px sans-serif';ctx.fillStyle='#f4bd55';ctx.fillText('fame.elcherlab.com',880,555);
  const link=document.createElement('a');link.download=`${game.name}-커리어-카드.png`;link.href=canvas.toDataURL('image/png');link.click();
}
