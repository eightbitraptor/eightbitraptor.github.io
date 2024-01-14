---
layout: weeknote
title: "The white death is falling"
slug: 2021-05
date: 2021-02-10T13:33:30Z
---

* It's snowing. Actually snowing, like settling on the ground and making everything white. This almost never happens here and I don't like it. It's icy and cold and makes driving anywhere really stressful.

  At least I don't actually have to drive anywhere because Pandemic.

  I mainly don't like the snow because I have the balance of a drunk gnat glued to a housebrick. I fall over almost every time it gets remotely icy or snows. I have fallen down concrete stairs, knocked myself unconsios on a roadside and various other forms of hurt. This time is no exception, I've already stacked it twice in my own bloody driveway.

  Playing in the snow with Phoebe was fun though, I'll allow that.

* My switches arrived. I love getting new switches, although now comes the certain knowledge that I'm going to want to lube them and apply switch films to get the feel and sound profile that I like. Modding switches is definitely the most time consuming and for me, the least enjoyable part of the hobby. Worth the effort though.
* I had to renew my eightbitraptor.com domain this week. Sadly I only noticed because my financial advisor was confused about why her emails to me were bouncing. Oops. So if you tried to visit the site at some point in the middle of the week and it just wasn't here then sorry about that. (lol, jk, as if anyone visits this site other than immediately after I tweet about it anyway).
* We got a new bed and a new mattress this week. After 3 years of having Phoebe crawl in in the middle of the night and then proceed to kick me in the kidneys for the rest of the night I've been looking forward to upgrading to a king size. It does not dissapoint.

  We got one of the new Eve hybrid mattress things that arrives in a box, not used to this as we've always just had traditional mattresses until now. First impressions are that the jury is still out, it's hard as nails.

  Bed is decidedly less exciting than mattress however. It's a second hand frame that we bought off Facebook marketplace, so I did make a morally ambiguous journey into the next town over to collect it. Government lockdown advice is whack. I'm explicitly allowed to go and collect stuff I bought from a website as long as it's physically located in a shop. But I don't think I'm allowed to go and collect stuff I've bought through a website if the location I'm collecting from is not a shop. Anyway, I picked it up from the kerb outside someone's house. No one came within 2 metres of me, no one got COVID. All good.

* As part of all this we moved our old double bed up into the loft, which is where I'm working from. I also took the opportunity to move some furniture around and play around with the layout, as well as giving it a good clean. It's much nicer working up here now. It feels like a proper room again (especially now there's a rug back down again) rather than just a place to store our old shit, that I happened to work in.

* Work remains engaging, which is ace. No major progress to report, however I did learn one lesson the hard way, which should perhaps have been obvious in hindsight.

  `GC.disable` in Ruby only actually disables the GC from the point it's called. This means that any GC runs that are triggered while the interpreter is booting, or the parser is parsing your code will still happen. I spent an embarrasingly long time trying to work out how to actually disable the GC in Ruby while I was testing some changes that I knew broke it. I settled just for commenting the line out of the main interpreter loop that turns it on in the first place. I don't know if there's a better way.

* Nan's funeral was this week. COVID funerals are still shit.

* I still haven't made this website have the cool opengraph card things, and on top of that I'm getting even later in publishing my weeknotes, whoops.
