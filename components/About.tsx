import React from 'react';
import { ViewState } from '../types';
import { Reveal } from './Motion';
import StrainArt from './StrainArt';
import { StrainType } from '../types';
import { ShieldCheck, Dna, Globe, Leaf, Droplets, Sun, Beaker, Sprout, Wind, Thermometer, Microscope, Layers, Recycle, Award, Link as LinkIcon, Fingerprint, Ruler, BookOpen, Heart, Activity, FileCheck, Users, MessageCircle } from 'lucide-react';

const About: React.FC<{ onNavigate?: (v: ViewState) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-10">
      
      {/* 1. THE MANIFESTO (HERO) */}
      <div className="text-center mb-20 md:mb-32 relative pt-10 md:pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[300px] md:h-[500px] blur-[90px] md:blur-[130px] -z-10 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(20,184,166,.28), rgba(16,185,129,.25) 50%, transparent 70%)' }} />
        <span className="chip mb-8 text-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Est. 2026 • Las Vegas Roots
        </span>
        <h1 className="text-6xl md:text-[9rem] font-extrabold mb-6 md:mb-8 tracking-tighter leading-[0.88] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <span className="text-gradient-silver">ONE SEED</span> <br/>
            <span className="font-display italic font-normal text-gradient pr-3">one soul.</span>
        </h1>
        <p className="text-zinc-300 text-lg md:text-3xl max-w-4xl mx-auto leading-relaxed font-light text-balance px-4">
          We reject the industrialization of nature. We believe that every single plant is a unique universe. No factory farms. No salt-based synthetics. Just individual, organic expression.
        </p>
      </div>

      {/* 2. THE ORIGIN STORY */}
      <div className="grid lg:grid-cols-2 gap-12 md:gap-16 mb-24 md:mb-40 items-start">
         <div className="relative lg:sticky lg:top-24">
            <span className="eyebrow mb-4 block">01 // The origin</span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gradient-silver mb-6 md:mb-8 leading-[0.98]">The “Clean”<br/><span className="font-display italic font-normal text-gradient">genesis.</span></h2>
            <div className="prose prose-invert prose-lg text-zinc-300/90 space-y-5 leading-relaxed text-lg">
               <p>
                  Clean Genetics wasn't started in a boardroom. It began in a garage in 2012, with a single 600W HPS light and a relentless obsession with perfection.
               </p>
               <p>
                  Our founder, known simply as <strong>"Gene"</strong> within the underground forum communities, grew tired of the "mids" flooding the market. As legalization loomed, he watched as passion projects were bought out by venture capitalists. Quality plummeted. Pests became rampant. The soul of the plant was being traded for quarterly profits.
               </p>
               <p>
                  Gene went the other way. He downsized. He instituted a "Micro-Cultivation" protocol that limited plant counts to ensure every single root zone could be hand-watered and inspected daily.
               </p>
               <blockquote className="border-l-2 border-emerald-300 pl-6 font-display text-2xl md:text-3xl leading-snug text-white my-8">
                  "If you can't tell me the exact pH of the runoff of Plant #04 specifically, you aren't growing cannabis. You're manufacturing biomass." — Gene
               </blockquote>
            </div>
         </div>
         <div className="space-y-8">
            <div className="spot glass p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint className="w-32 h-32 text-emerald-500" /></div>
                <h3 className="text-2xl font-bold text-white mb-4">The "Pheno Hunt" Obsession</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                   Most breeders pop 10 seeds and pick a winner. We pop 1,000. Our selection process is notoriously brutal. We actively stress-test our potential mothers with heat, drought, and high humidity. If a plant herms, molds, or slows down—it is culled immediately. Only the "Titans" survive to become Clean Genetics breeding stock.
                </p>
                <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                   <div><div className="text-2xl font-black text-white">10k+</div><div className="text-xs text-zinc-500 uppercase tracking-wider">Seeds Popped</div></div>
                   <div><div className="text-2xl font-black text-white">98%</div><div className="text-xs text-zinc-500 uppercase tracking-wider">Cull Rate</div></div>
                   <div><div className="text-2xl font-black text-white">Zero</div><div className="text-xs text-zinc-500 uppercase tracking-wider">Pest Tolerance</div></div>
                </div>
            </div>
            
            <div className="rounded-3xl p-8 border border-emerald-300/20" style={{ background: 'radial-gradient(120% 100% at 0% 0%, rgba(18,210,143,.16), rgba(3,9,8,.5) 70%)' }}>
                <h3 className="text-2xl font-bold text-emerald-400 mb-4">The "Clean" Standard</h3>
                <ul className="space-y-4">
                   {[
                      "No Synthetic Pesticides (Ever)",
                      "No Salt-Based Nutrients during Flower",
                      "Full Panel HLVd Testing on Every Mother",
                      "30-Day Cure Minimum before Seed Pack"
                   ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300">
                         <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                         {item}
                      </li>
                   ))}
                </ul>
            </div>
         </div>
      </div>


      {/* 4. EXCLUSIVE PARTNER */}
      <div className="mb-40 relative">
         <div className="absolute -inset-4 bg-gradient-to-r from-emerald-900/20 to-black rounded-[3rem] blur-xl -z-10" />
         <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center z-10 relative">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Award className="w-6 h-6 text-yellow-500" />
                     <span className="text-yellow-500 font-bold uppercase tracking-widest text-sm">Exclusive Partnership</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Sourced from the Elite:<br/>The Grass Menagerie</h2>
                  <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                     <p>
                        Our genetic library is strictly curated. We source our foundational pollen directly from <strong>The Grass Menagerie Seed Co</strong>.
                     </p>
                     <p>
                        Their dedication to rare landrace preservation aligns with our philosophy: purity over volume. Every seed we offer is a direct descendant of their elite lineage.
                     </p>
                     <a 
                        href="https://www.thegrassmenagerieseedco.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors mt-4 text-xl group"
                     >
                        Visit Our Genetic Source <LinkIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </a>
                  </div>
               </div>
               <div className="relative h-[500px] rounded-2xl overflow-hidden border border-zinc-700 group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                  <StrainArt id="grass-menagerie" type={StrainType.INDICA} glyph={0.7} className="absolute inset-0 flex items-center justify-center" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center p-12">
                         <Dna className="w-20 h-20 text-white/80 mx-auto mb-4 drop-shadow-[0_0_24px_rgba(255,255,255,.5)]" />
                         <h3 className="text-3xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg">The Grass Menagerie<br/>Seed Co.</h3>
                     </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                     <div className="flex gap-4">
                        <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-lg border border-zinc-700">
                           <span className="block text-emerald-500 font-bold text-2xl">100%</span>
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Organic Origins</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 5. THE MEDICINE PHILOSOPHY */}
      <div className="grid lg:grid-cols-2 gap-16 mb-40">
          <div className="p-8 md:p-12 rounded-[3rem] border border-fuchsia-300/15 flex flex-col justify-center" style={{ background: 'radial-gradient(120% 100% at 0% 0%, rgba(236,72,153,.2), rgba(3,9,8,.5) 70%)' }}>
             <Heart className="w-16 h-16 text-pink-500 mb-8" />
             <h2 className="text-5xl font-extrabold tracking-tighter text-gradient-silver mb-6">Beyond the <span className="font-display italic font-normal text-gradient-warm">high.</span></h2>
             <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                For years, the industry chased high THC percentages. "30% THC or bust." We think this is misguided. The plant is a pharmacy, not just a vodka shot.
             </p>
             <p className="text-zinc-400 text-lg leading-relaxed">
                Our new <strong>Medicines</strong> department focuses on the "minor" cannabinoids. CBG for gut health. CBN for sleep. THCV for appetite suppression. We believe the future of cannabis is specific, targeted wellness, not just getting stoned.
             </p>
          </div>
          <div className="space-y-8">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Our Medicinal Targets</h3>
             <div className="space-y-4">
                <div className="flex gap-6 items-start border-b border-zinc-800 pb-6">
                   <div className="text-3xl font-black text-pink-500 w-24">CBN</div>
                   <div>
                      <h4 className="text-white font-bold text-lg">Cannabinol (The Sleep Molecule)</h4>
                      <p className="text-zinc-500 text-sm mt-1">Degraded THC that acts as a potent sedative. We age specific harvest batches for 6 months to naturally convert THC to CBN.</p>
                   </div>
                </div>
                <div className="flex gap-6 items-start border-b border-zinc-800 pb-6">
                   <div className="text-3xl font-black text-blue-500 w-24">CBG</div>
                   <div>
                      <h4 className="text-white font-bold text-lg">Cannabigerol (The Mother)</h4>
                      <p className="text-zinc-500 text-sm mt-1">The stem cell of cannabinoids. Powerful anti-inflammatory and neuroprotectant properties without the heavy high.</p>
                   </div>
                </div>
                <div className="flex gap-6 items-start border-b border-zinc-800 pb-6">
                   <div className="text-3xl font-black text-yellow-500 w-24">Terps</div>
                   <div>
                      <h4 className="text-white font-bold text-lg">The Entourage Effect</h4>
                      <p className="text-zinc-500 text-sm mt-1">We prove that 18% THC with 4% Terpenes hits harder and heals better than 30% THC with 0% Terpenes.</p>
                   </div>
                </div>
             </div>
          </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="max-w-4xl mx-auto mb-20">
         <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Common Questions</h2>
            <p className="text-zinc-500">Transparency is key. Here is how we operate.</p>
         </div>

         <div className="space-y-6">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-white font-bold flex items-center gap-3 mb-2"><Globe className="w-5 h-5 text-emerald-500" /> Do you ship internationally?</h4>
                <p className="text-zinc-400 text-sm pl-8">Yes. We ship seeds worldwide as "Novelty Hemp Souvenirs" in stealth packaging. However, clones and live plants are currently USA-only due to agricultural restrictions.</p>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-white font-bold flex items-center gap-3 mb-2"><Activity className="w-5 h-5 text-emerald-500" /> What is your germination guarantee?</h4>
                <p className="text-zinc-400 text-sm pl-8">We guarantee a 95% germination rate. If your seeds fail to pop, send us a photo of the method used, and we will replace the pack for free. We stand by our genetics.</p>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-white font-bold flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-emerald-500" /> How do I join the Discord?</h4>
                <p className="text-zinc-400 text-sm pl-8">Our private Discord is for verified customers only. Inside, you'll find grow logs, 24/7 help from our master growers, and early access to drops. You receive an invite link in your order confirmation email.</p>
             </div>
             
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h4 className="text-white font-bold flex items-center gap-3 mb-2"><MessageCircle className="w-5 h-5 text-emerald-500" /> Is "Gene" a real person?</h4>
                <p className="text-zinc-400 text-sm pl-8">Gene is the founder, but the "Gene" you chat with on this site is an AI model trained on 12 years of his personal grow journals, notes, and forum posts. It's his brain, digitized.</p>
             </div>
         </div>
      </div>

      {/* 7. Footer CTA */}
      <div className="text-center border-t border-zinc-800 pt-20">
         <p className="text-zinc-500 text-sm mb-4">Ready to start your journey?</p>
         <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gradient-silver mb-10">Grow the best.<br/><span className="font-display italic font-normal text-gradient">Smoke the best.</span></h2>
         <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate?.('SHOP')} className="btn-primary h-14 px-8">Shop Seeds</button>
            <a href="mailto:divercityrecords@gmail.com" className="btn-glass h-14 px-8">Contact Support</a>
         </div>
      </div>

    </div>
  );
};

export default About;