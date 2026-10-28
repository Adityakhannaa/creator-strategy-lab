import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Download, FlaskConical, Gauge, Lightbulb, RotateCcw, Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { bestResponses, findPureNash, isDominant, mixedEquilibrium, scenarios, type Matrix, type Scenario } from './gameTheory';

type Stage = 0 | 1 | 2 | 3 | 4;
const stageNames = ['Scenario', 'Payoff matrix', 'Strategic analysis', 'Results', 'Conclusion'];

export default function App() {
  const [stage, setStage] = useState<Stage>(0);
  const [scenarioId, setScenarioId] = useState('trend');
  const [matrix, setMatrix] = useState<Matrix>(scenarios[0].matrix.map(row => row.map(p => [...p] as [number,number]) as [[number,number],[number,number]]) as Matrix);
  const [showWhy, setShowWhy] = useState(false);
  const [editing, setEditing] = useState(false);
  const scenario = scenarios.find(s => s.id === scenarioId)!;
  const equilibria = useMemo(() => findPureNash(matrix), [matrix]);
  const responses = useMemo(() => bestResponses(matrix), [matrix]);
  const mixed = useMemo(() => mixedEquilibrium(matrix), [matrix]);
  const dominantA = [0,1].find(s => isDominant(matrix, 0, s as 0|1));
  const dominantB = [0,1].find(s => isDominant(matrix, 1, s as 0|1));
  const jointBest = Math.max(...matrix.flat().map(p => p[0] + p[1]));
  const chartData = [
    { combination: `${scenario.strategyA[0]} / ${scenario.strategyB[0]}`, a: matrix[0][0][0], b: matrix[0][0][1], total: matrix[0][0][0]+matrix[0][0][1] },
    { combination: `${scenario.strategyA[0]} / ${scenario.strategyB[1]}`, a: matrix[0][1][0], b: matrix[0][1][1], total: matrix[0][1][0]+matrix[0][1][1] },
    { combination: `${scenario.strategyA[1]} / ${scenario.strategyB[0]}`, a: matrix[1][0][0], b: matrix[1][0][1], total: matrix[1][0][0]+matrix[1][0][1] },
    { combination: `${scenario.strategyA[1]} / ${scenario.strategyB[1]}`, a: matrix[1][1][0], b: matrix[1][1][1], total: matrix[1][1][0]+matrix[1][1][1] }
  ];
  function chooseScenario(s: Scenario) {
    setScenarioId(s.id);
    setMatrix(s.matrix.map(row => row.map(p => [...p] as [number,number]) as [[number,number],[number,number]]) as Matrix);
    setStage(1);
  }
  function updatePayoff(r:number,c:number,player:0|1,value:number) {
    setMatrix(prev => prev.map((row,ri) => row.map((pair,ci) => ri===r && ci===c ? pair.map((v,pi)=>pi===player?value:v) as [number,number] : pair) as [[number,number],[number,number]]) as Matrix);
  }
  function reset() { const s = scenarios.find(x=>x.id===scenarioId)!; setMatrix(s.matrix.map(row=>row.map(p=>[...p] as [number,number]) as [[number,number],[number,number]]) as Matrix); setStage(0); setEditing(false); }
  function exportResults() {
    const lines = [
      'CREATOR STRATEGY LAB — GAME ANALYSIS', `Generated: ${new Date().toLocaleString()}`, `Scenario: ${scenario.title}`, `Research question: ${scenario.question}`, `Players: ${scenario.playerA} vs ${scenario.playerB}`, '',
      'Payoff matrix (Creator A, Creator B):',
      `${scenario.strategyA[0]} / ${scenario.strategyB[0]}: ${matrix[0][0].join(', ')}`,
      `${scenario.strategyA[0]} / ${scenario.strategyB[1]}: ${matrix[0][1].join(', ')}`,
      `${scenario.strategyA[1]} / ${scenario.strategyB[0]}: ${matrix[1][0].join(', ')}`,
      `${scenario.strategyA[1]} / ${scenario.strategyB[1]}: ${matrix[1][1].join(', ')}`, '',
      `Pure Nash equilibria: ${equilibria.length ? equilibria.map(e=>`(${scenario.strategyA[e.row]}, ${scenario.strategyB[e.col]}) payoffs ${e.payoff.join(', ')}`).join('; ') : 'None'}`,
      `Weakly dominant strategy for Creator A: ${dominantA === undefined ? 'None' : scenario.strategyA[dominantA]}`,
      `Weakly dominant strategy for Creator B: ${dominantB === undefined ? 'None' : scenario.strategyB[dominantB]}`,
      `Interior mixed equilibrium: ${mixed ? `Creator A chooses ${scenario.strategyA[0]} with p=${mixed.p.toFixed(3)}; Creator B chooses ${scenario.strategyB[0]} with q=${mixed.q.toFixed(3)}` : 'No interior mixed equilibrium identified'}`,
      '', 'Interpretation: a pure Nash equilibrium is a strategy pair where neither player can improve by unilaterally switching.',
      'Assumptions and limitations:', '- Two players, two strategies each, simultaneous one-shot choices.',
      '- Payoffs are hypothetical utility scores, not measured platform analytics.',
      '- Mixed-strategy output reports only an interior candidate; boundary/degenerate cases need separate interpretation.'
    ].join('\n');
    const blob = new Blob([lines], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-strategy-${scenario.id}-analysis.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Keep the object URL alive long enough for browsers to begin the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><FlaskConical size={21}/></div><div><b>CREATOR</b><span>STRATEGY LAB</span></div></div>
      <div className="side-label">SIMULATION WORKSPACE</div>
      <div className="side-scenario"><span className="live-dot"/><div><small>ACTIVE MODEL</small><b>{scenario.title}</b><span>2-player · simultaneous game</span></div></div>
      <nav className="steps">{stageNames.map((name,i)=><button key={name} className={`step ${stage===i?'active':''} ${stage>i?'done':''}`} onClick={()=>setStage(i as Stage)}><span className="step-num">{stage>i?<Check size={14}/>:`0${i+1}`}</span><span>{name}</span>{stage===i&&<span className="step-arrow">↗</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="mini-stat"><span>MODEL TYPE</span><b>2 × 2 Normal-form game</b></div><div className="mini-stat"><span>PAYOFF SCALE</span><b>0–10 · illustrative utility</b></div><p>Built for exploring strategic choices — not predicting exact reach or engagement.</p></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">PROJECTS <span>/</span> SOCIAL CONTENT COMPETITION <span>/</span> <b>{stageNames[stage].toUpperCase()}</b></div><div className="top-actions"><span className="status"><i/> Model ready</span><button className="icon-button" title="Reset simulation" onClick={reset}><RotateCcw size={16}/></button><button className="export-button" onClick={exportResults}><Download size={15}/> Export analysis</button></div></header>
      <div className="content">
        {stage===0&&<section className="page-section">
          <div className="eyebrow"><span>01</span> DEFINE THE GAME</div><h1>Choose a competition<br/><em>to investigate.</em></h1><p className="lead">Model two creators making strategic content decisions. Change the scenario, inspect the incentives, and discover which outcomes are stable.</p>
          <div className="scenario-grid">{scenarios.map((s,i)=><button className={`scenario-card ${scenarioId===s.id?'chosen':''}`} key={s.id} onClick={()=>{setScenarioId(s.id);setMatrix(s.matrix.map(row=>row.map(p=>[...p] as [number,number]) as [[number,number],[number,number]]) as Matrix);}}><div className="card-top"><span className="scenario-icon">{[<TrendingUp size={21}/>,<Gauge size={21}/>,<Users size={21}/>,<Zap size={21}/>][i]}</span><span className="card-index">CASE 0{i+1}</span></div><h3>{s.title}</h3><span className="category">{s.category}</span><p>{s.description}</p><div className="card-question"><CircleHelp size={15}/>{s.question}</div><div className="card-footer">{scenarioId===s.id?<span className="selected"><Check size={14}/> Selected</span>:<span>Use this scenario <ArrowRight size={14}/></span>}</div></button>)}</div>
          <div className="bottom-row"><div className="note"><Lightbulb size={18}/><span><b>What this model does</b> It represents each creator’s outcome as a payoff that depends on both players’ choices. Payoffs are hypothetical and editable.</span></div><button className="primary" onClick={()=>setStage(1)}>Build payoff matrix <ArrowRight size={16}/></button></div>
        </section>}

        {stage===1&&<section className="page-section">
          <div className="eyebrow"><span>02</span> REPRESENT INCENTIVES</div><h1>The payoff <em>matrix.</em></h1><p className="lead">Each cell shows <b>Creator A’s payoff first</b> and Creator B’s second. A larger number represents greater modeled strategic value.</p>
          <div className="context-strip"><div className="context-symbol"><Sparkles size={20}/></div><div><b>{scenario.title}</b><p>{scenario.context}</p></div><button className="text-button" onClick={()=>setShowWhy(!showWhy)}>{showWhy?'Hide rationale':'Why these payoffs?'} <ChevronDown size={15}/></button></div>
          {showWhy&&<div className="rationale"><b>Modeling assumption</b><p>{scenario.implication} Values are illustrative utility scores on a 0–10 scale. They are not scraped platform metrics, and they should be treated as assumptions to test rather than facts about creator behaviour.</p></div>}
          <div className="matrix-card">
            <div className="matrix-heading"><div><span className="eyebrow small">NORMAL-FORM GAME</span><h3>Strategic outcomes</h3></div><button className={`edit-button ${editing?'is-on':''}`} onClick={()=>setEditing(!editing)}>{editing?'Finish editing':'Edit payoffs'}</button></div>
            <div className="matrix-wrap"><table className="payoff-table"><thead><tr><th className="corner"><span>Creator A ↓<br/>Creator B →</span></th><th>{scenario.strategyB[0]}</th><th>{scenario.strategyB[1]}</th></tr></thead><tbody>{[0,1].map(r=><tr key={r}><th><span className="row-label">{scenario.strategyA[r]}</span></th>{[0,1].map(c=>{const eq=equilibria.some(e=>e.row===r&&e.col===c);return <td key={c} className={eq?'equilibrium':''}><div className="payoff-pair"><span className="payoff-a">{matrix[r][c][0]}</span><span className="comma">,</span><span className="payoff-b">{matrix[r][c][1]}</span></div>{eq&&<span className="eq-tag"><Target size={12}/> NASH EQUILIBRIUM</span>}{editing&&<div className="edit-pair"><label>A <input type="number" min="0" max="10" value={matrix[r][c][0]} onChange={e=>updatePayoff(r,c,0,Math.max(0,Math.min(10,Number(e.target.value))))}/></label><label>B <input type="number" min="0" max="10" value={matrix[r][c][1]} onChange={e=>updatePayoff(r,c,1,Math.max(0,Math.min(10,Number(e.target.value))))}/></label></div>}</td>})}</tr>)}</tbody></table></div>
            <div className="matrix-legend"><span><i className="legend-a"/> Creator A payoff</span><span><i className="legend-b"/> Creator B payoff</span><span><i className="legend-eq"/> Mutual best response</span><span>Scale: 0–10</span></div>
          </div>
          <div className="bottom-row"><button className="secondary" onClick={()=>setStage(0)}><ArrowLeft size={16}/> Back to scenarios</button><button className="primary" onClick={()=>setStage(2)}>Analyze strategic behaviour <ArrowRight size={16}/></button></div>
        </section>}

        {stage===2&&<section className="page-section">
          <div className="eyebrow"><span>03</span> SOLVE THE GAME</div><h1>What is each creator’s<br/><em>best response?</em></h1><p className="lead">A best response is the strategy that gives a player the highest payoff, given the other player’s choice. Nash equilibrium occurs when both are best-responding at once.</p>
          <div className="metric-grid"><Metric icon={<Target size={20}/>} label="PURE NASH EQUILIBRIA" value={`${equilibria.length}`} sub={equilibria.length===1?'One stable strategy pair':equilibria.length>1?'Multiple stable strategy pairs':'No pure-strategy equilibrium'}/><Metric icon={<TrendingUp size={20}/>} label="DOMINANT STRATEGY" value={dominantA!==undefined&&dominantB!==undefined?'Both players':dominantA!==undefined?'Creator A':dominantB!==undefined?'Creator B':'None'} sub="A strategy that is never worse, regardless of rival choice"/><Metric icon={<Sparkles size={20}/>} label="BEST JOINT PAYOFF" value={`${jointBest} / 20`} sub="Maximum combined payoff in the current matrix"/></div>
          <div className="analysis-layout"><div className="matrix-card analysis-matrix"><div className="matrix-heading"><div><span className="eyebrow small">BEST RESPONSE MAP</span><h3>Mutual incentives</h3></div><span className="tiny-label">Green = equilibrium</span></div><div className="matrix-wrap"><table className="payoff-table"><thead><tr><th className="corner">A ↓ / B →</th><th>{scenario.strategyB[0]}</th><th>{scenario.strategyB[1]}</th></tr></thead><tbody>{[0,1].map(r=><tr key={r}><th>{scenario.strategyA[r]}</th>{[0,1].map(c=>{const aBest=responses.rowsForColumn[c].includes(r),bBest=responses.colsForRow[r].includes(c),eq=aBest&&bBest;return <td key={c} className={`${eq?'equilibrium':''} ${aBest?'a-best':''} ${bBest?'b-best':''}`}><div className="payoff-pair"><span className={aBest?'payoff-a best':'payoff-a'}>{matrix[r][c][0]}</span><span className="comma">,</span><span className={bBest?'payoff-b best':'payoff-b'}>{matrix[r][c][1]}</span></div><div className="response-tags">{aBest&&<span>A best</span>}{bBest&&<span>B best</span>}</div>{eq&&<span className="eq-tag"><Target size={12}/> NASH</span>}</td>})}</tr>)}</tbody></table></div><p className="footnote">Underlined/highlighted payoffs are best responses to the opponent’s strategy. A cell marked Nash means neither player benefits from switching alone.</p></div>
            <div className="response-column"><ResponseCard title="Creator A’s response" player="A" strategies={scenario.strategyA} opponentStrategies={scenario.strategyB} responses={responses.rowsForColumn} matrix={matrix}/><ResponseCard title="Creator B’s response" player="B" strategies={scenario.strategyB} opponentStrategies={scenario.strategyA} responses={responses.colsForRow} matrix={matrix}/></div></div>
          <div className="equilibrium-panel"><div className="panel-icon"><Target size={22}/></div><div><span className="eyebrow small">EQUILIBRIUM CHECK</span><h3>{equilibria.length?`${equilibria.length} pure Nash equilibrium${equilibria.length>1?'a':''} found`:'No pure Nash equilibrium found'}</h3>{equilibria.length?<div className="equilibrium-list">{equilibria.map(e=><div key={`${e.row}-${e.col}`}><b>{scenario.strategyA[e.row]} + {scenario.strategyB[e.col]}</b><span>Payoffs ({e.payoff[0]}, {e.payoff[1]})</span></div>)}</div>:<p>Neither player has a mutually optimal pure-strategy pair. Check whether a mixed-strategy equilibrium exists in the next section.</p>}{mixed&&<p className="mixed-note">Interior mixed equilibrium: Creator A chooses “{scenario.strategyA[0]}” with probability {(mixed.p*100).toFixed(1)}%; Creator B chooses “{scenario.strategyB[0]}” with probability {(mixed.q*100).toFixed(1)}%.</p>}</div></div>
          <div className="bottom-row"><button className="secondary" onClick={()=>setStage(1)}><ArrowLeft size={16}/> Edit matrix</button><button className="primary" onClick={()=>setStage(3)}>Explore results & graphs <ArrowRight size={16}/></button></div>
        </section>}

        {stage===3&&<section className="page-section">
          <div className="eyebrow"><span>04</span> COMPARE OUTCOMES</div><h1>Read the <em>strategic landscape.</em></h1><p className="lead">Compare each strategy pair, see how payoffs change, and identify which outcomes are stable and which simply have a high combined score.</p>
          <div className="charts-grid"><div className="chart-card"><div className="chart-title"><div><span className="eyebrow small">PAYOFF COMPARISON</span><h3>Who benefits in each outcome?</h3></div><span className="chart-chip">Utility score</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:12,right:8,left:-18,bottom:45}}><CartesianGrid strokeDasharray="3 3" stroke="#e6e0d5"/><XAxis dataKey="combination" tick={{fontSize:10,fill:'#6f716e'}} interval={0} angle={-13} textAnchor="end" height={58}/><YAxis tick={{fontSize:11,fill:'#6f716e'}} domain={[0,10]}/><Tooltip/><Legend/><Bar dataKey="a" name="Creator A" fill="#236e62" radius={[4,4,0,0]}/><Bar dataKey="b" name="Creator B" fill="#e49b54" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
          <div className="chart-card"><div className="chart-title"><div><span className="eyebrow small">COMBINED VALUE</span><h3>Where is total payoff highest?</h3></div><span className="chart-chip">A + B</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:12,right:8,left:-18,bottom:45}}><CartesianGrid strokeDasharray="3 3" stroke="#e6e0d5"/><XAxis dataKey="combination" tick={{fontSize:10,fill:'#6f716e'}} interval={0} angle={-13} textAnchor="end" height={58}/><YAxis tick={{fontSize:11,fill:'#6f716e'}} domain={[0,20]}/><Tooltip/><Bar dataKey="total" name="Combined payoff" fill="#6479a4" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div></div>
          <div className="heatmap-card"><div className="chart-title"><div><span className="eyebrow small">PAYOFF HEATMAP</span><h3>Outcome-by-outcome incentives</h3></div><span className="heat-legend">Darker = higher value</span></div><div className="heatmap-grid">{[0,1].map(r=>[0,1].map(c=><div key={`${r}${c}`} className={`heat-cell ${equilibria.some(e=>e.row===r&&e.col===c)?'heat-eq':''}`} style={{background:`rgba(35,110,98,${0.07+matrix[r][c][0]/10*0.35})`}}><div className="heat-cell-head"><span>{scenario.strategyA[r]} / {scenario.strategyB[c]}</span>{equilibria.some(e=>e.row===r&&e.col===c)&&<span className="heat-nash">NASH</span>}</div><div className="heat-values"><span>A <b>{matrix[r][c][0]}</b></span><span>B <b>{matrix[r][c][1]}</b></span></div><div className="heat-total">Combined value <b>{matrix[r][c][0]+matrix[r][c][1]}</b></div></div>))}</div></div>
          <div className="insight-grid"><div className="insight-card"><Lightbulb size={19}/><div><b>Stability is not the same as efficiency</b><p>A Nash equilibrium is individually stable. It does not necessarily maximize combined payoff.</p></div></div><div className="insight-card"><Users size={19}/><div><b>Payoffs are interdependent</b><p>The same action can have a different value depending on the competitor’s choice.</p></div></div><div className="insight-card"><Gauge size={19}/><div><b>Test assumptions</b><p>Change payoffs in the matrix to see whether equilibrium outcomes change.</p></div></div></div>
          <div className="bottom-row"><button className="secondary" onClick={()=>setStage(2)}><ArrowLeft size={16}/> Back to analysis</button><button className="primary" onClick={()=>setStage(4)}>Interpret the findings <ArrowRight size={16}/></button></div>
        </section>}

        {stage===4&&<section className="page-section">
          <div className="eyebrow"><span>05</span> INTERPRET & CONCLUDE</div><h1>From numbers to <em>strategy.</em></h1><p className="lead">Translate the mathematical result into a clear explanation of how creator incentives interact — and what the model cannot tell us.</p>
          <div className="conclusion-hero"><div className="conclusion-symbol"><Target size={27}/></div><div><span className="eyebrow small">RESULT FOR THIS MODEL</span><h2>{equilibria.length===0?'No pure-strategy equilibrium':equilibria.length===1?'One stable strategic outcome':'Multiple stable strategic outcomes'}</h2><p>{equilibria.length===0?'The current payoff assumptions do not produce a cell where both creators are simultaneously best-responding. A mixed strategy may be relevant.':equilibria.length===1?'One strategy pair is stable against unilateral deviation under the modeled payoffs. Neither creator can improve their own payoff by switching alone.':'More than one strategy pair is stable. The model alone cannot predict which equilibrium creators will coordinate on.'}</p></div></div>
          <div className="conclusion-columns"><div className="conclusion-card"><span className="section-number">01</span><h3>What the equilibrium says</h3>{equilibria.length?equilibria.map(e=><p key={`${e.row}${e.col}`}><b>{scenario.strategyA[e.row]} + {scenario.strategyB[e.col]}</b> yields ({e.payoff[0]}, {e.payoff[1]}). Given the other player’s action, neither player gains by switching strategy alone.</p>):<p>No pure equilibrium appears in this matrix. The calculated mixed-strategy result can describe randomized choices when its probabilities fall strictly between zero and one.</p>}</div><div className="conclusion-card"><span className="section-number">02</span><h3>Practical implication</h3><p>{scenario.implication}</p><p>For a real creator, decisions should also use audience retention, reach, engagement quality, production cost, brand fit, and repeated performance — not this payoff table alone.</p></div></div>
          <div className="limitations"><div className="limit-title"><CircleHelp size={19}/><h3>Limitations & assumptions</h3></div><ul><li>All payoffs are hypothetical teaching values, not measured platform or creator data.</li><li>The model has two players and two strategies; real creator competition is more complex.</li><li>It represents a one-shot, simultaneous game rather than a repeated game with learning and reputation.</li><li>It assumes the payoff scores adequately represent each creator’s preferences.</li><li>Algorithm changes, audience overlap, production budgets, sponsorships and platform policies are not explicitly modeled.</li></ul></div>
          <div className="export-panel"><div><h3>Ready to explain the result?</h3><p>Export a concise text report containing the payoff matrix, equilibrium results, and assumptions. Use it as a record of this simulation.</p></div><button className="primary" onClick={exportResults}><Download size={16}/> Export analysis</button></div>
          <div className="bottom-row"><button className="secondary" onClick={()=>setStage(3)}><ArrowLeft size={16}/> Back to graphs</button><button className="primary" onClick={reset}><RotateCcw size={16}/> Start new simulation</button></div>
        </section>}
        <footer className="app-footer"><span>CREATOR STRATEGY LAB · GAME THEORY PROJECT</span><span>Educational simulation <i/> Hypothetical payoffs</span></footer>
      </div>
    </main>
  </div>;
}

function Metric({icon,label,value,sub}:{icon:React.ReactNode,label:string,value:string,sub:string}) {
  return <div className="metric-card"><div className="metric-icon">{icon}</div><div><span>{label}</span><b>{value}</b><p>{sub}</p></div></div>;
}
function ResponseCard({title,player,strategies,opponentStrategies,responses,matrix}:{title:string,player:'A'|'B',strategies:[string,string],opponentStrategies:[string,string],responses:number[][],matrix:Matrix}) {
  return <div className="response-card"><div className="response-head"><span className="response-icon"><Target size={17}/></span><h3>{title}</h3></div>{[0,1].map(opponent=>{const best=responses[opponent];const values=[0,1].map(s=>player==='A'?matrix[s][opponent][0]:matrix[opponent][s][1]);return <div className="response-line" key={opponent}><span className="opponent-choice">If {player==='A'?'Creator B':'Creator A'} chooses <b>{opponentStrategies[opponent]}</b></span><div className="response-options">{best.map(s=><span className="response-pill" key={s}>{strategies[s]} <b>{values[s]}</b></span>)}</div></div>})}<p className="response-explain">Best response(s) are computed by comparing payoffs against the opponent’s fixed action. Tied strategies are both shown.</p></div>;
}