---
layout: talk
title: "Plug & Play Garbage Collection with MMTk"
event: "RubyKaigi 2023"
event_url: https://rubykaigi.org/2023/
location: Matsumoto, Japan
date: 2023-05-11T00:00:00+0800
abstract: |
    Dynamic memory management is a complex and often controversial topic. There are a wide variety of different algorithms and approaches that one can take towards managing memory, both manually and automatically.
    Some language implementations tend to pick their favourite approach early in their development, like Pythons reference counting and Ruby's extended Mark Sweep collector, and stick with it for the long term.
    Others, like the JVM, aim to have a more configurable approach, with multiple Garbage Collection algorithms that can be configured at runtime, or even dynamically tuned by the VM during program execution.
    What if we could have that for Ruby?
    This talk is going to be an exploration of how we can support multiple GC algorithms in Ruby. We'll talk about building a unified memory management API, and explore our integration with MMTk, a research project to build a unified memory management toolkit, with integrations into the JVM, v8, Julia, and now Ruby.
---

<iframe width="560" height="315"
src="https://www.youtube.com/embed/chhNDhyPbyc?si=AzG2ATe6KsteYJ6z"
title="YouTube video player" frameborder="0" allow="accelerometer; autoplay;
clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowfullscreen></iframe>

Hi everybody, thank you for coming.

This talk is called plug and play Garbage Collection with mmtk and my goal is to
propose what I think is a way that we can fundamentally improve Ruby's garbage
collector to be able to take advantage of some of the latest advantages in GC
research not just now but easily in the future as well

My name is Matt I've been working in shopify's Ruby and rails infrastructure
team for about almost three years now and I am a ruby committer since March this
year and I'm really into garbage collection and memory management.
 
 So in order to understand how to move forward with GC I think it's necessary
 for us to understand not just where we are now but how we got here so let's
 wind the clock all the way back to December 1995 when the first public version
 of Ruby was released.
 
 we'll talk about what GC looked like then and how it's evolved kind of since
 then.
 
 so the entire memory management code in Ruby 0.95 was 562 lines of code.
 
 today at over 14 000 lines that same file is kind of 25 times larger than it
 was back then, but despite this huge growth the lineage of Ruby's memory
 management is still very clear from that Old code.
 
 just like today Ruby objects were implemented as our values these fixed size C
 structs which were laid out in called a sort of contiguous memory regions, and
 then those regions were grouped together.
 
 now there are some differences in terminology with modern Ruby but the general
 Heap layout is very recognizable even at this early stage.
 
 and just like today these empty our value slots were linked together in what's
 called a free list. and when Ruby needs to needed to allocate a new object it
 unlinks the first empty slot from the free list and wrote into it. and if there
 were no slots on the free list that was when GC would start.
 
 so GC in Ruby 095 was obviously much simpler than it is today given how little
 code there was but the core algorithm hasn't changed all that much.
 
 Ruby 0.95 implemented Mark and sweep. an algorithm originally described almost
 incidentally in like three paragraphs in this 1960 research paper about lisp.
 
 so with Mark and sweep the GC starts when the program tries to allocate but it
 can't because the free list is empty. it then starts from this set of known
 routes and it traces the whole object graph and it marks every object that can
 be reached like this along the way.
 
 and then it sweeps or it goes through every single object on the Heap and any
 that aren't marked as live get added back to that free list and that's exactly
 what ruby 0.95 did it set this head a bit in each object to show when it was
 marked and then it iterated over all the objects and and either didn't any that
 didn't have that Mark bit set got added back to the free list we have to fast
 forward over 15 years to see the first major step change in Ruby's GC which was
 lazy sweeping introduced in 2011 for Ruby 193. so Mark and sweep is a stop the
 world collector this means that program execution is stopped while the GC is
 running and this was a huge problem at the time especially for like rails apps
 if Ruby G seed in the middle of a web request it would really negatively impact
 the user experience and applications frequently saw these really slow P99
 response times lazy sweeping uh tried to mitigate that by splitting that sweet
 phase out into many shorter steps so even if GC did run during the middle of a
 request the impact would be reduced and lazy sweeping made the GC pause time
 shorter but because it had to do a bunch of extra work to keep track of where
 it was the sweeping process actually lowered overall application performance a
 little and this is a good example of the trade-offs involved in building GCS so
 in real world terms a web application might be willing to trade a slight drop
 in overall requests per second if it could see a pretty sizable drop in P99
 response times but obviously that's going to depend on your workload so after
 this there was about two years until the next major change when Ruby 2.1
 introduced generations to the GC generational collectors are built around a
 pair of observations made in a 1984 research paper that most objects in a
 system will die young and that those that don't are effectively going to live
 forever so generational collectors can then improve performance over
 non-generational ones by not wasting time effectively scanning a bunch of
 objects that are unlikely to change so Ruby's first implementation of a
 generational GC had two generations the young gen and the old gen and marking
 got split into two corresponding phases a minor which just looked at the Young
 objects and a major which look to all objects combined minor marks were the
 default any object that survived a minor Mark became an old object and then a
 major was triggered when the old object count doubled so one interesting
 observation of generational collectors is that it's possible to add a reference
 from an old object to a young object and if this happens and the next marking
 phase is a minor Mark then the references from that Old objects are going to be
 ignored and that live young object will get swept so in the paper this is
 solved using a right barrier which is just some code that detects when an
 object gains a reference to a young object and then adds that old object to a
 remembered set this the remembered set is just a set of objects that will
 always be considered during a minor Mark in addition to the young objects and
 this is exactly what ruby did but Ruby has always had this like really rich C
 API so that gem authors can write native extensions in C and because none of
 the gems were using these right barrier apis yet an object originating from a c
 extension could could cause application crashes with this new GC and Ruby
 solved this by kind of codifying a distinction between a right barrier
 protected and a right barrier unprotected object and all objects from
 originating from C extensions were unprotected by default so gem authors had to
 explicitly Implement barrier support in their gems so right barrier unprotected
 objects can never be promoted to the old generation they're always going to be
 considered for marking even during a minor GC and this allowed Ruby to
 implement a generational GC in a backwards compatible way but at the expense of
 performance because a minor Mark is now going to be considering a load of
 objects that it might not necessarily have to and it's also worth pointing out
 here that Ruby implements generational GCS differently to the way it's done in
 a lot of traditional GC literature generational GCS are most often evacuating
 GCS and rubies is not so in an evacuating generation of GC the generations
 usually live in completely separate memory spaces and promoting an object means
 physically copying it into the new region and this gives us the ability to tune
 performance for the specific characteristics of each memory region we could
 choose a faster allocation strategy for the young objects or we can use copying
 to improve data locality in the old gen space and we don't get to do these
 things in Ruby yet but back to our timeline the next major Improvement in GC
 takes us a year forward to 2014 when Ruby 2 2 introduced incremental marking
 incremental marking is analogous to the sweeping lazy sweeping from Ruby 193 so
 just as lazy sweeping split up that sweet step sweepstep incremental marking
 split up the long markings phase of a major collection but because marking
 involved tracing the whole object graph Ruby had to be able to pause marking
 and kind of resume where it left off and at the time there was no way to be
 able to do this so there's a well-known pattern called the tri-color
 abstraction to do this which was originally observed by Edgar Dykstra in 1978
 and this was implemented in Ruby at the time so this says that at the start of
 tracing all objects are possibly dead and are referred to as white as they're
 reached by tracing they are put into a processing State and colored gray and
 then when they've been completely scanned they're presumed alive and colored
 black so classifying objects like this allows the state of marking to be saved
 and then picked up where we left off by essentially ignoring all of the black
 objects and just continuing to mark from the gray objects but we have the same
 problem here as we had with old objects in a generational GC it's possible to
 add a new reference to a black object and then this reference is going to get
 swept because as far as the GC is concerned that black object is already fully
 marked and this reference doesn't exist so Ruby solved this with right barriers
 again this time when a new reference was added to a black object that black
 object would be colored gray so that it won't be ignored by the next minor mark
 so at the end of 2014 Ruby had a non-copying generational and fully incremental
 Mark and sweep garbage collector the next major change came in 2019 when Ruby 2
 7 introduced a compactor and this was pretty Monumental at the time this was
 the first time the objects had ever been able to move around on the Heap uh
 Ruby's compactor like its original GC core was based on an algorithm from from
 lisp in the 60s because it was well suited to the that contiguous regions and
 fixed size objects approach that Ruby uses to lay out memory so compaction
 opened up a lot of possibilities for performance improvements we can reduce the
 Heap size we can improve data locality by decreasing fragmentation in the Heap
 and we can improve copy on right friendliness Again by reducing fragmentation
 but again C extensions had to explicitly opt in This Time by writing custom
 codes to update their own references that was then actually executed by the GC
 and this meant that as with the right barrier objects from C extensions just
 didn't support compaction to start with they had to be pinned on the Heap so
 they'd never move and that offsets a bunch of the benefit that compaction can
 provide so in addition to this exposing the gc's explicit compaction support
 providing a function to find the location of a moved object and then requiring
 extension authors to implement their own reference moving logic is leaking a
 pretty big abstraction into a public API so in 2020 Ruby 3.0 the compactor
 gained the ability to be run automatically and previously it was a manual
 process you had to trigger gc.compact in order to do it whereas 3.0 allowed
 compaction to be interleaved with the sweep phase of a major GC so spaces that
 were opened up in a heat page during sweeping would get automatically filled by
 pulling in objects from Elsewhere on the Heap but Ruby had previously made an
 assumption that it was safe to modify other objects on the Heap during sweeping
 because they'd never move so classes are a good example of this every class has
 a reference to a list of its subclasses as well as a pointer to its superclass
 which results in this kind of arrangement so if for instance this red class is
 going to get swept then the parent is going to need it subclass list modified
 but if that parent has already been moved then we can no longer guarantee that
 we're modifying the right thing and this put us in a similar situation that we
 saw with incremental and generational GCS assumptions had been made about the
 GC that no longer held and it was solved in a similar way this time with a read
 barrier rather than a right barrier so if a read was attempted on an object
 that had been moved that object would be restored back into its original place
 before that read was allowed to go ahead and this worked around the object
 modification problem it allowed Auto compaction to be implemented but the
 introduction of these read barriers introduced a whole bunch of extra code
 which slowed down throughput and made GC pauses longer so compaction is
 currently an optional feature in Ruby and it's it's still disabled by default
 and this brings us to Ruby 3.2 and the most recent change which is variable
 with allocation now my colleague Peter and I spoke about this at rubyke a
 couple of years ago if you want to know the intricate details but to summarize
 we focused on improving application performance rather than GC pause Times by
 changing the way that memory was allocated to improve data locality and
 reducing a bunch of external allocations that were happening and this brings us
 pretty much up to date with where we are now so I've skipped over a few smaller
 but still important changes just for time constraints I think a history of full
 history of Ruby's GC could be a good full talk on its own but to summarize Ruby
 ships with an incremental non-copying generational Mark and sweep collector
 with an optional compaction phase and no one ever set out with this as a design
 goal Ruby's GC has grown organically over the last 29 years or so it's hard to
 fix assumptions in Ruby that no longer held and sometimes it solved problems in
 ways that were appropriate at the time but have since made GC more inflexible
 and all this is completely normal in 2011 a research paper was published that
 analyzed the current landscape of managed languages and it concluded that
 language developers need to take memory performance seriously from the start
 and that the alternative is a good compiler that's let down by memory
 performance so as we move on with this talk what I want you to keep in your
 mind is that Ruby's GC implementation is 30 years old it's based on algorithms
 that are decades older than it is a large and complex part of the code base and
 making changes to it is often a multi-year effort and when you bake a GC into a
 VM like this you often end up with these weak abstraction boundaries we've seen
 some examples already so other parts of the VM start making assumptions about
 how the collector works or how memory is structured and your collector
 effectively becomes welded in place and it makes it really hard to adopt new
 ideas and it can lead to stifling innovation in the VM so with that said I want
 to talk about some of the Innovation that has been happening in the GC research
 Community I'm going to talk about two algorithms I find really interesting and
 the first of these is imix which was presented at the programming language
 design and implementation Forum or pldi back in 2008. so every GC algorithm can
 be essentially broken down into three core components there's allocation object
 allocation garbage identification and Reclamation and each of these components
 has some well-documented fundamental approaches allocation has a free list
 approach which we've already seen in Ruby and a bump pointer approach where
 which just uses a marker to the first free address in the Heap and then
 allocates at that point and that pushes that marker or bumps that pointer
 forward to the next available space garbage identification has an implicit
 approach where we identify what is garbage by first identifying what is not and
 this is what Ruby's doing with the with the tracing there's also an explicit
 approach where objects track their own references so they know when they're no
 longer required reference counting has some benefits but also a pretty big
 drawback when it comes to Circular references so this doesn't really get used
 much on its own anymore and Reclamation has sweeping where garbage objects are
 then wiped and their address is added back to a free list but it also has
 evacuation which we've touched on earlier where live objects are copied to a
 new memory space and then the old space is dropped entirely and it also has
 compaction which is similar to evacuation but instead of copying to a new
 region the objects are copied to one end of the of the region they already
 exist in and these fundamental processes can be combined together to form like
 three canonical collectors there's Mark and sweep which is a free list tracing
 and sweeping there's Mark compact which composes a bump pointer with tracing
 and compaction and then there's semi-space which composes bump pointers tracing
 and evacuation and each one of these canonical algorithms has different
 performance characteristics which make it more suitable for its own specific
 workloads these canonical collectors are however never almost never used in
 isolation anymore because higher level GC algorithms like G1 Shenandoah and zgc
 which is the current darling of openjdk they all build on these algorithms in
 various novel ways they combine them together with generations with concurrency
 and parallelism and then they layer on a bunch of optimizations in order to
 achieve the high performance that's kind of required by an Enterprise VM so MX
 was a new canonical collector it formalized at the time a new class of GC
 algorithms called Mark region and in doing so it outperformed all the existing
 classical collectors by up to 25 depending on Heap size averaged across sort of
 20 GC standard benchmarks so this chart's looking at total program execution
 time against Heap size and as well as showing the traditional GC performance
 dichotomy like you can either have a fast collector or a memory efficient
 collector it also shows MX kind of breaking that dichotomy by outperforming all
 of the other canonical collectors even at high Heap sizes where we would
 normally expect to see advantages from an evacuating collector like semispace
 and it does this on a couple of fronts this shot this chart is looking at
 actual uh GC time against Heap size and we can see MX matching Mark and sweep
 as the fastest collector so spending the least overall time in GC and at the
 same time it's also providing comparable data locality performance to
 semi-space a collector which is optimized for good locality so this chart is
 actually looking at level 2 cache misses against uh Heap size which is kind of
 a good proxy for application performance so if our level 2 Miss rate is low
 then the CPU caches are being used more effectively and this implies better
 data locality it makes this currently in production use by inco a concurrent
 programming language and Scala native which is a managed runtime and ahead of
 time compiler for Scala um there's all there's a PR to implement MX in GHC
 which is seeing some pretty positive real world impacts and interestingly for
 us rubinius had an evacuating generational GC which used semi-space for its
 young gen and imex for its old gen so the next algorithm I want to talk about
 is lxr which was presented in this paper at pldi in 2022. lxr is a new
 high-level GC it combines immix with reference counting and a series of
 optimizations to significantly outperform the most popular collectors in
 production use today so lxr got benchmarked against G1 which is throughput
 optimized Shenandoah which is latency optimized and zgc which attempts to
 optimize for both against a variety of Heap sizes and these results are
 fantastic so the numbers are normalized means relative to G1 performance so
 lower the number is better performance firstly we can see that zgc won't even
 run these benchmarks unless it's allowed to use six times the amount of memory
 that The Benchmark would normally require but when we do look at the actual
 results we can see lxr outperforming the other collectors on both latency and
 throughput with just a single exception on G1 with high Heap sizes and even
 that's a close call so MX and lxr were both implemented inside a framework
 called mmtk the memory management toolkit mmtk is an initiative to provide a
 concrete set of building blocks to enable building high-level GC algorithms a
 sort of construction kit for garbage collectors so it's possible to take the
 fundamental concepts we spoke about and combine them in novel ways to build new
 GCS it was originally built in 2004 as part of the jike's research VM which was
 a flexible open test bed for prototyping and experimenting with VM design and
 as part of that mmtk's modularity and clear abstractions provided a predictable
 way of experimenting with GCS MX was built on this initial Java platform and in
 2017 mmtk was Rewritten from scratch as a standalone project in order to make
 it language agnostic and this was the version that Alexa was implemented in and
 as a testament to mmtk's modularity and good abstractions lxr apparently went
 from initial commit to full implementation and published research paper in 19
 weeks weeks which is staggering a staggering turnaround time for a GC that's
 currently beating its competition in benchmarks mmtk currently has bindings for
 several languages and run times there's open jdk there's V8 the JavaScript
 runtime in Chrome there's the jokes rvm and there's work in progress on
 bindings for Julia and GHC the Haskell compiler and as you may have guessed by
 now bindings are also in progress for Ruby Chris Eaton an extremely gifted
 member of the Ruby Community who tragically passed away last year believed that
 it would greatly benefit Ruby to be much closer to The Cutting Edge of virtual
 machine and interpreter research and among his many achievements one initiative
 he led a Shopify was to enable our investment into research projects that we
 believe are interesting to the Ruby community and one of these research
 projects was mmtk so Shopify joined Huawei and Google as industry sponsors of
 mmtk and whilst the implementation effort has been led by researchers at the
 Australian National University and the mmtk team Shopify have been supporting
 with our experience and expertise with Ruby so let's look at how we connect
 mmtk and Ruby at the moment mmtk consists of the core which is distributed as
 like a rust Library crate this is where all of the GC algorithms and building
 blocks are implemented basically anything that is not host runtime specific to
 connect it to Ruby we have to write a binding layer and this binding layer
 consists of two parts the first is written in Rust and it sits conceptually
 closer to mmtk core this is going to take contain code that is Ruby specific
 but for performance reasons needs to be closer to the GC so tracing is a good
 example of this Ruby implements its own object layout in our values which mmtk
 is going to need to know about but we don't want to be calling across a
 language boundary every time we trace an object because that would be really
 slow and the second part of The Binding is written in C the same language as
 Ruby so it contains code that is mmtk specific but benefits from being closer
 to the Ruby side like functions to start and stop all the Ruby threads being
 executed or starting and stopping the world if you like mmtk and the Rough Side
 of the bindings get combined into a shared object which is then linked against
 Ruby at compile time and the rust bindings just use a ffi forum function
 interface to expose functions that can easily be called by the Ruby layer so
 I'm gonna I'm gonna show a quick demo of where we're at at the moment if you
 want to play around with this yourself we are building nightly Ruby releases on
 this GitHub repo you can either download a pre-built binary or there's a
 container filing some build scripts to build your own so this is a version of
 Ruby that I've built with mmtk we can see that by looking at the version string
 and it contains mmtk and then when we pass the mmtk arguments we will see
 firstly that mmtk is initialized with its Mark and sweep collector which is
 default and we also see a little uppercase plus mmtk brackets Mark sweep and
 that tells us that mmtk is active with Mark sweep collector so by default just
 manually running a GC and getting some stats is going to use Ruby's built-in GC
 not mmtk by default we can see the output of GC stat here is exactly what we
 would expect we can run mmtk's default collector by just passing mmtk or we can
 pick a plan explicitly using the mmtk plan option so here is Ruby running a
 successful GC with mmtk's Mark sweep implementation and you can see we've added
 some logging and some Market sweep mmtk Heap numbers to GC stat output and this
 is mmck running a full successful collection with MX which is a pretty big
 milestone for us now there are caveats of course this work is still very
 experimental a lot of the C Ruby test Suite doesn't work right now and mmtk
 itself is Linux only and currently it's possible to boot a rails app using Mark
 sweep but MX kind of crashes with rails it needs to use needs to use smaller
 Scripts and performance is still very much on the roadmap we are focusing on
 correctness right now we're not as fast as the Ruby's internal GC yet so
 obviously there's still a lot to do um but where do I want to go from here now
 this is the part of the talk where I try and sell you something um I think we
 have some real scope for improving Ruby's GC so at the moment our Fork contains
 a load of code like this we're just using the preprocessor to include stuff
 when mtk is compiled in and then we have to check whether it's enabled at
 runtime it's not very clean and doing things like this has a bunch of obvious
 downsides like it's it's going to result in more complex code it's hard to
 reason about it's prone to error it's going to be hard to maintain which might
 make maintaining Ruby's existing GC harder but it has had some positives so
 firstly it's allowed us to get an integration done in a reasonable time and
 we've got mtk working together with a few different collectors now and we can
 focus on on getting that code better and as we continue to go down this route
 it's helped us to highlight some areas of Ruby that aren't flexible enough at
 the moment to handle having multiple collectors we are identifying where some
 abstractions are leaking and or assumptions are being made about the memory
 model But ultimately this is not the code that we want to ship both V8 and GHC
 when implementing support for mmtk did a lot of upfront work to identify all of
 the pain points that made having multiple GCS hard they abstracted out a bunch
 of GC related functionality into a consistent interface so that when it came to
 writing the mmtk bindings they just had to implement against that interface and
 that minimized the number of weird edge cases they had to consider so we're in
 a unique situation at the moment I think with Ruby we already have this big
 stable mature GC and we have mmtk being implemented as a second system so
 working out what's common to them gives us the ability to build that common
 feature set into a general purpose API but what if we didn't just stop at
 implementing support for mmtk can we build a generic memory management
 interface for Ruby one that could maybe Plug and Play GCS at runtime whether
 that's mmtk or Ruby's internal GC or something else entirely I think this idea
 has a lot going for it it could allow us to have a library of GC
 implementations built as a kind of C extension and plugged into Ruby at runtime
 depending on the load like mmtk and Ruby's VM would be two of these but this
 would mean that anyone could develop and deploy a custom Ruby GC we could use
 mmtk to design and build new GCS giving GC researchers another platform to test
 against and bringing Ruby to the Forefront of like GC and memory management
 research we could provide a method of easily testing custom GC patches or
 configurations by duplicating a GC module and then just split testing it at
 runtime maybe in our production environments to see what the difference is or
 we could just do something else we would have this fully extensible memory
 management system and all of the creative freedom that comes with it so yeah I
 think this idea has a lot going for it now of course there are questions that
 are going to gonna need answers the first is how do we manage C extensions what
 kind of API are we going to want to pause to provide for extensions how are we
 going to deal with extensions that are already in the wild um so we've already
 started some work towards this with a couple of recent patches and this one
 merges the two existing GC extension callbacks for marking and moving into a
 single tracing function and this provides a way of just declaring where the
 references are in your gem so that the GC can trace them rather than requiring
 the extension authors to implement their own custom tracing code the second
 question is the potential development burden inside Ruby to maintain a stable
 interface like this now this kind of code organization is going to require
 diligence and upkeep to ensure that it stays relevant as the the VM grows
 around it and the last question I don't have a good answer for yet is uh
 performance what the post performance penalties are going to be like for
 implementing a modular GC like this I would like to think that the vast
 performance improvements we'll see from adopting modern GC research combined
 with the convenience of being able to innovate and iterate quickly will fart
 outweigh any potential performance penalties we're going to pay due to some
 extra abstraction in the GC but obviously this is something that we are going
 to need to test and we'll need proven but in conclusion what I want to leave
 you with is the idea that GC is not a solved problem there are newer
 Innovations in memory management techniques happening all of the time and what
 really excites me is the ability to be able to like make use of some of these
 in Ruby I I believe we have a real opportunity to like transform Ruby's memory
 management story at the moment so that we can use high performance modern GCS
 to take advantage of new innovation and to really future proof us as a language
 so that Ruby will can always be and will always remain a good language Choice
 whatever your production workload and with that I will say thank you very much
 for coming to my talk if you want to talk about any of the ideas here please
 come and see me I am always happy to talk about GC and there are links to all
 of the papers and references I used for this talk at this URL and I hope you
 enjoy the rest of Rubik thank you very much [Applause] so with Mark and sweep
 the GC starts when the program tries to allocate but it can't because the free
 list is empty it then starts from this set of known routes and it traces the
 whole object graph and it marks every object that can be reached like this
 along the way and then it sweeps or it goes through every single object on the
 Heap and any that aren't marked as live get added back to that free list and
 that's exactly what ruby 0.95 did it set this head a bit in each object to show
 when it was marked and then it iterated over all the objects and and either
 didn't any that didn't have that Mark bit set got added back to the free list
 we have to fast forward over 15 years to see the first major step change in
 Ruby's GC which was lazy sweeping introduced in 2011 for Ruby 193. so Mark and
 sweep is a stop the world collector this means that program execution is
 stopped while the GC is running and this was a huge problem at the time
 especially for like rails apps if Ruby G seed in the middle of a web request it
 would really negatively impact the user experience and applications frequently
 saw these really slow P99 response times lazy sweeping uh tried to mitigate
 that by splitting that sweet phase out into many shorter steps so even if GC
 did run during the middle of a request the impact would be reduced and lazy
 sweeping made the GC pause time shorter but because it had to do a bunch of
 extra work to keep track of where it was the sweeping process actually lowered
 overall application performance a little and this is a good example of the
 trade-offs involved in building GCS so in real world terms a web application
 might be willing to trade a slight drop in overall requests per second if it
 could see a pretty sizable drop in P99 response times but obviously that's
 going to depend on your workload so after this there was about two years until
 the next major change when Ruby 2.1 introduced generations to the GC
 generational collectors are built around a pair of observations made in a 1984
 research paper that most objects in a system will die young and that those that
 don't are effectively going to live forever so generational collectors can then
 improve performance over non-generational ones by not wasting time effectively
 scanning a bunch of objects that are unlikely to change so Ruby's first
 implementation of a generational GC had two generations the young gen and the
 old gen and marking got split into two corresponding phases a minor which just
 looked at the Young objects and a major which look to all objects combined
 minor marks were the default any object that survived a minor Mark became an
 old object and then a major was triggered when the old object count doubled so
 one interesting observation of generational collectors is that it's possible to
 add a reference from an old object to a young object and if this happens and
 the next marking phase is a minor Mark then the references from that Old
 objects are going to be ignored and that live young object will get swept so in
 the paper this is solved using a right barrier which is just some code that
 detects when an object gains a reference to a young object and then adds that
 old object to a remembered set this the remembered set is just a set of objects
 that will always be considered during a minor Mark in addition to the young
 objects and this is exactly what ruby did but Ruby has always had this like
 really rich C API so that gem authors can write native extensions in C and
 because none of the gems were using these right barrier apis yet an object
 originating from a c extension could could cause application crashes with this
 new GC and Ruby solved this by kind of codifying a distinction between a right
 barrier protected and a right barrier unprotected object and all objects from
 originating from C extensions were unprotected by default so gem authors had to
 explicitly Implement barrier support in their gems so right barrier unprotected
 objects can never be promoted to the old generation they're always going to be
 considered for marking even during a minor GC and this allowed Ruby to
 implement a generational GC in a backwards compatible way but at the expense of
 performance because a minor Mark is now going to be considering a load of
 objects that it might not necessarily have to and it's also worth pointing out
 here that Ruby implements generational GCS differently to the way it's done in
 a lot of traditional GC literature generational GCS are most often evacuating
 GCS and rubies is not so in an evacuating generation of GC the generations
 usually live in completely separate memory spaces and promoting an object means
 physically copying it into the new region and this gives us the ability to tune
 performance for the specific characteristics of each memory region we could
 choose a faster allocation strategy for the young objects or we can use copying
 to improve data locality in the old gen space and we don't get to do these
 things in Ruby yet but back to our timeline the next major Improvement in GC
 takes us a year forward to 2014 when Ruby 2 2 introduced incremental marking
 incremental marking is analogous to the sweeping lazy sweeping from Ruby 193 so
 just as lazy sweeping split up that sweet step sweepstep incremental marking
 split up the long markings phase of a major collection but because marking
 involved tracing the whole object graph Ruby had to be able to pause marking
 and kind of resume where it left off and at the time there was no way to be
 able to do this so there's a well-known pattern called the tri-color
 abstraction to do this which was originally observed by Edgar Dykstra in 1978
 and this was implemented in Ruby at the time so this says that at the start of
 tracing all objects are possibly dead and are referred to as white as they're
 reached by tracing they are put into a processing State and colored gray and
 then when they've been completely scanned they're presumed alive and colored
 black so classifying objects like this allows the state of marking to be saved
 and then picked up where we left off by essentially ignoring all of the black
 objects and just continuing to mark from the gray objects but we have the same
 problem here as we had with old objects in a generational GC it's possible to
 add a new reference to a black object and then this reference is going to get
 swept because as far as the GC is concerned that black object is already fully
 marked and this reference doesn't exist so Ruby solved this with right barriers
 again this time when a new reference was added to a black object that black
 object would be colored gray so that it won't be ignored by the next minor mark
 so at the end of 2014 Ruby had a non-copying generational and fully incremental
 Mark and sweep garbage collector the next major change came in 2019 when Ruby 2
 7 introduced a compactor and this was pretty Monumental at the time this was
 the first time the objects had ever been able to move around on the Heap uh
 Ruby's compactor like its original GC core was based on an algorithm from from
 lisp in the 60s because it was well suited to the that contiguous regions and
 fixed size objects approach that Ruby uses to lay out memory so compaction
 opened up a lot of possibilities for performance improvements we can reduce the
 Heap size we can improve data locality by decreasing fragmentation in the Heap
 and we can improve copy on right friendliness Again by reducing fragmentation
 but again C extensions had to explicitly opt in This Time by writing custom
 codes to update their own references that was then actually executed by the GC
 and this meant that as with the right barrier objects from C extensions just
 didn't support compaction to start with they had to be pinned on the Heap so
 they'd never move and that offsets a bunch of the benefit that compaction can
 provide so in addition to this exposing the gc's explicit compaction support
 providing a function to find the location of a moved object and then requiring
 extension authors to implement their own reference moving logic is leaking a
 pretty big abstraction into a public API so in 2020 Ruby 3.0 the compactor
 gained the ability to be run automatically and previously it was a manual
 process you had to trigger gc.compact in order to do it whereas 3.0 allowed
 compaction to be interleaved with the sweep phase of a major GC so spaces that
 were opened up in a heat page during sweeping would get automatically filled by
 pulling in objects from Elsewhere on the Heap but Ruby had previously made an
 assumption that it was safe to modify other objects on the Heap during sweeping
 because they'd never move so classes are a good example of this every class has
 a reference to a list of its subclasses as well as a pointer to its superclass
 which results in this kind of arrangement so if for instance this red class is
 going to get swept then the parent is going to need it subclass list modified
 but if that parent has already been moved then we can no longer guarantee that
 we're modifying the right thing and this put us in a similar situation that we
 saw with incremental and generational GCS assumptions had been made about the
 GC that no longer held and it was solved in a similar way this time with a read
 barrier rather than a right barrier so if a read was attempted on an object
 that had been moved that object would be restored back into its original place
 before that read was allowed to go ahead and this worked around the object
 modification problem it allowed Auto compaction to be implemented but the
 introduction of these read barriers introduced a whole bunch of extra code
 which slowed down throughput and made GC pauses longer so compaction is
 currently an optional feature in Ruby and it's it's still disabled by default
 and this brings us to Ruby 3.2 and the most recent change which is variable
 with allocation now my colleague Peter and I spoke about this at rubyke a
 couple of years ago if you want to know the intricate details but to summarize
 we focused on improving application performance rather than GC pause Times by
 changing the way that memory was allocated to improve data locality and
 reducing a bunch of external allocations that were happening and this brings us
 pretty much up to date with where we are now so I've skipped over a few smaller
 but still important changes just for time constraints I think a history of full
 history of Ruby's GC could be a good full talk on its own but to summarize Ruby
 ships with an incremental non-copying generational Mark and sweep collector
 with an optional compaction phase and no one ever set out with this as a design
 goal Ruby's GC has grown organically over the last 29 years or so it's hard to
 fix assumptions in Ruby that no longer held and sometimes it solved problems in
 ways that were appropriate at the time but have since made GC more inflexible
 and all this is completely normal in 2011 a research paper was published that
 analyzed the current landscape of managed languages and it concluded that
 language developers need to take memory performance seriously from the start
 and that the alternative is a good compiler that's let down by memory
 performance so as we move on with this talk what I want you to keep in your
 mind is that Ruby's GC implementation is 30 years old it's based on algorithms
 that are decades older than it is a large and complex part of the code base and
 making changes to it is often a multi-year effort and when you bake a GC into a
 VM like this you often end up with these weak abstraction boundaries we've seen
 some examples already so other parts of the VM start making assumptions about
 how the collector works or how memory is structured and your collector
 effectively becomes welded in place and it makes it really hard to adopt new
 ideas and it can lead to stifling innovation in the VM so with that said I want
 to talk about some of the Innovation that has been happening in the GC research
 Community I'm going to talk about two algorithms I find really interesting and
 the first of these is imix which was presented at the programming language
 design and implementation Forum or pldi back in 2008. so every GC algorithm can
 be essentially broken down into three core components there's allocation object
 allocation garbage identification and Reclamation and each of these components
 has some well-documented fundamental approaches allocation has a free list
 approach which we've already seen in Ruby and a bump pointer approach where
 which just uses a marker to the first free address in the Heap and then
 allocates at that point and that pushes that marker or bumps that pointer
 forward to the next available space garbage identification has an implicit
 approach where we identify what is garbage by first identifying what is not and
 this is what Ruby's doing with the with the tracing there's also an explicit
 approach where objects track their own references so they know when they're no
 longer required reference counting has some benefits but also a pretty big
 drawback when it comes to Circular references so this doesn't really get used
 much on its own anymore and Reclamation has sweeping where garbage objects are
 then wiped and their address is added back to a free list but it also has
 evacuation which we've touched on earlier where live objects are copied to a
 new memory space and then the old space is dropped entirely and it also has
 compaction which is similar to evacuation but instead of copying to a new
 region the objects are copied to one end of the of the region they already
 exist in and these fundamental processes can be combined together to form like
 three canonical collectors there's Mark and sweep which is a free list tracing
 and sweeping there's Mark compact which composes a bump pointer with tracing
 and compaction and then there's semi-space which composes bump pointers tracing
 and evacuation and each one of these canonical algorithms has different
 performance characteristics which make it more suitable for its own specific
 workloads these canonical collectors are however never almost never used in
 isolation anymore because higher level GC algorithms like G1 Shenandoah and zgc
 which is the current darling of openjdk they all build on these algorithms in
 various novel ways they combine them together with generations with concurrency
 and parallelism and then they layer on a bunch of optimizations in order to
 achieve the high performance that's kind of required by an Enterprise VM so MX
 was a new canonical collector it formalized at the time a new class of GC
 algorithms called Mark region and in doing so it outperformed all the existing
 classical collectors by up to 25 depending on Heap size averaged across sort of
 20 GC standard benchmarks so this chart's looking at total program execution
 time against Heap size and as well as showing the traditional GC performance
 dichotomy like you can either have a fast collector or a memory efficient
 collector it also shows MX kind of breaking that dichotomy by outperforming all
 of the other canonical collectors even at high Heap sizes where we would
 normally expect to see advantages from an evacuating collector like semispace
 and it does this on a couple of fronts this shot this chart is looking at
 actual uh GC time against Heap size and we can see MX matching Mark and sweep
 as the fastest collector so spending the least overall time in GC and at the
 same time it's also providing comparable data locality performance to
 semi-space a collector which is optimized for good locality so this chart is
 actually looking at level 2 cache misses against uh Heap size which is kind of
 a good proxy for application performance so if our level 2 Miss rate is low
 then the CPU caches are being used more effectively and this implies better
 data locality it makes this currently in production use by inco a concurrent
 programming language and Scala native which is a managed runtime and ahead of
 time compiler for Scala um there's all there's a PR to implement MX in GHC
 which is seeing some pretty positive real world impacts and interestingly for
 us rubinius had an evacuating generational GC which used semi-space for its
 young gen and imex for its old gen so the next algorithm I want to talk about
 is lxr which was presented in this paper at pldi in 2022. lxr is a new
 high-level GC it combines immix with reference counting and a series of
 optimizations to significantly outperform the most popular collectors in
 production use today so lxr got benchmarked against G1 which is throughput
 optimized Shenandoah which is latency optimized and zgc which attempts to
 optimize for both against a variety of Heap sizes and these results are
 fantastic so the numbers are normalized means relative to G1 performance so
 lower the number is better performance firstly we can see that zgc won't even
 run these benchmarks unless it's allowed to use six times the amount of memory
 that The Benchmark would normally require but when we do look at the actual
 results we can see lxr outperforming the other collectors on both latency and
 throughput with just a single exception on G1 with high Heap sizes and even
 that's a close call so MX and lxr were both implemented inside a framework
 called mmtk the memory management toolkit mmtk is an initiative to provide a
 concrete set of building blocks to enable building high-level GC algorithms a
 sort of construction kit for garbage collectors so it's possible to take the
 fundamental concepts we spoke about and combine them in novel ways to build new
 GCS it was originally built in 2004 as part of the jike's research VM which was
 a flexible open test bed for prototyping and experimenting with VM design and
 as part of that mmtk's modularity and clear abstractions provided a predictable
 way of experimenting with GCS MX was built on this initial Java platform and in
 2017 mmtk was Rewritten from scratch as a standalone project in order to make
 it language agnostic and this was the version that Alexa was implemented in and
 as a testament to mmtk's modularity and good abstractions lxr apparently went
 from initial commit to full implementation and published research paper in 19
 weeks weeks which is staggering a staggering turnaround time for a GC that's
 currently beating its competition in benchmarks mmtk currently has bindings for
 several languages and run times there's open jdk there's V8 the JavaScript
 runtime in Chrome there's the jokes rvm and there's work in progress on
 bindings for Julia and GHC the Haskell compiler and as you may have guessed by
 now bindings are also in progress for Ruby Chris Eaton an extremely gifted
 member of the Ruby Community who tragically passed away last year believed that
 it would greatly benefit Ruby to be much closer to The Cutting Edge of virtual
 machine and interpreter research and among his many achievements one initiative
 he led a Shopify was to enable our investment into research projects that we
 believe are interesting to the Ruby community and one of these research
 projects was mmtk so Shopify joined Huawei and Google as industry sponsors of
 mmtk and whilst the implementation effort has been led by researchers at the
 Australian National University and the mmtk team Shopify have been supporting
 with our experience and expertise with Ruby so let's look at how we connect
 mmtk and Ruby at the moment mmtk consists of the core which is distributed as
 like a rust Library crate this is where all of the GC algorithms and building
 blocks are implemented basically anything that is not host runtime specific to
 connect it to Ruby we have to write a binding layer and this binding layer
 consists of two parts the first is written in Rust and it sits conceptually
 closer to mmtk core this is going to take contain code that is Ruby specific
 but for performance reasons needs to be closer to the GC so tracing is a good
 example of this Ruby implements its own object layout in our values which mmtk
 is going to need to know about but we don't want to be calling across a
 language boundary every time we trace an object because that would be really
 slow and the second part of The Binding is written in C the same language as
 Ruby so it contains code that is mmtk specific but benefits from being closer
 to the Ruby side like functions to start and stop all the Ruby threads being
 executed or starting and stopping the world if you like mmtk and the Rough Side
 of the bindings get combined into a shared object which is then linked against
 Ruby at compile time and the rust bindings just use a ffi forum function
 interface to expose functions that can easily be called by the Ruby layer so
 I'm gonna I'm gonna show a quick demo of where we're at at the moment if you
 want to play around with this yourself we are building nightly Ruby releases on
 this GitHub repo you can either download a pre-built binary or there's a
 container filing some build scripts to build your own so this is a version of
 Ruby that I've built with mmtk we can see that by looking at the version string
 and it contains mmtk and then when we pass the mmtk arguments we will see
 firstly that mmtk is initialized with its Mark and sweep collector which is
 default and we also see a little uppercase plus mmtk brackets Mark sweep and
 that tells us that mmtk is active with Mark sweep collector so by default just
 manually running a GC and getting some stats is going to use Ruby's built-in GC
 not mmtk by default we can see the output of GC stat here is exactly what we
 would expect we can run mmtk's default collector by just passing mmtk or we can
 pick a plan explicitly using the mmtk plan option so here is Ruby running a
 successful GC with mmtk's Mark sweep implementation and you can see we've added
 some logging and some Market sweep mmtk Heap numbers to GC stat output and this
 is mmck running a full successful collection with MX which is a pretty big
 milestone for us now there are caveats of course this work is still very
 experimental a lot of the C Ruby test Suite doesn't work right now and mmtk
 itself is Linux only and currently it's possible to boot a rails app using Mark
 sweep but MX kind of crashes with rails it needs to use needs to use smaller
 Scripts and performance is still very much on the roadmap we are focusing on
 correctness right now we're not as fast as the Ruby's internal GC yet so
 obviously there's still a lot to do um but where do I want to go from here now
 this is the part of the talk where I try and sell you something um I think we
 have some real scope for improving Ruby's GC so at the moment our Fork contains
 a load of code like this we're just using the preprocessor to include stuff
 when mtk is compiled in and then we have to check whether it's enabled at
 runtime it's not very clean and doing things like this has a bunch of obvious
 downsides like it's it's going to result in more complex code it's hard to
 reason about it's prone to error it's going to be hard to maintain which might
 make maintaining Ruby's existing GC harder but it has had some positives so
 firstly it's allowed us to get an integration done in a reasonable time and
 we've got mtk working together with a few different collectors now and we can
 focus on on getting that code better and as we continue to go down this route
 it's helped us to highlight some areas of Ruby that aren't flexible enough at
 the moment to handle having multiple collectors we are identifying where some
 abstractions are leaking and or assumptions are being made about the memory
 model But ultimately this is not the code that we want to ship both V8 and GHC
 when implementing support for mmtk did a lot of upfront work to identify all of
 the pain points that made having multiple GCS hard they abstracted out a bunch
 of GC related functionality into a consistent interface so that when it came to
 writing the mmtk bindings they just had to implement against that interface and
 that minimized the number of weird edge cases they had to consider so we're in
 a unique situation at the moment I think with Ruby we already have this big
 stable mature GC and we have mmtk being implemented as a second system so
 working out what's common to them gives us the ability to build that common
 feature set into a general purpose API but what if we didn't just stop at
 implementing support for mmtk can we build a generic memory management
 interface for Ruby one that could maybe Plug and Play GCS at runtime whether
 that's mmtk or Ruby's internal GC or something else entirely I think this idea
 has a lot going for it it could allow us to have a library of GC
 implementations built as a kind of C extension and plugged into Ruby at runtime
 depending on the load like mmtk and Ruby's VM would be two of these but this
 would mean that anyone could develop and deploy a custom Ruby GC we could use
 mmtk to design and build new GCS giving GC researchers another platform to test
 against and bringing Ruby to the Forefront of like GC and memory management
 research we could provide a method of easily testing custom GC patches or
 configurations by duplicating a GC module and then just split testing it at
 runtime maybe in our production environments to see what the difference is or
 we could just do something else we would have this fully extensible memory
 management system and all of the creative freedom that comes with it so yeah I
 think this idea has a lot going for it now of course there are questions that
 are going to gonna need answers the first is how do we manage C extensions what
 kind of API are we going to want to pause to provide for extensions how are we
 going to deal with extensions that are already in the wild um so we've already
 started some work towards this with a couple of recent patches and this one
 merges the two existing GC extension callbacks for marking and moving into a
 single tracing function and this provides a way of just declaring where the
 references are in your gem so that the GC can trace them rather than requiring
 the extension authors to implement their own custom tracing code the second
 question is the potential development burden inside Ruby to maintain a stable
 interface like this now this kind of code organization is going to require
 diligence and upkeep to ensure that it stays relevant as the the VM grows
 around it and the last question I don't have a good answer for yet is uh
 performance what the post performance penalties are going to be like for
 implementing a modular GC like this I would like to think that the vast
 performance improvements we'll see from adopting modern GC research combined
 with the convenience of being able to innovate and iterate quickly will fart
 outweigh any potential performance penalties we're going to pay due to some
 extra abstraction in the GC but obviously this is something that we are going
 to need to test and we'll need proven but in conclusion what I want to leave
 you with is the idea that GC is not a solved problem there are newer
 Innovations in memory management techniques happening all of the time and what
 really excites me is the ability to be able to like make use of some of these
 in Ruby I I believe we have a real opportunity to like transform Ruby's memory
 management story at the moment so that we can use high performance modern GCS
 to take advantage of new innovation and to really future proof us as a language
 so that Ruby will can always be and will always remain a good language Choice
 whatever your production workload and with that I will say thank you very much
 for coming to my talk if you want to talk about any of the ideas here please
 come and see me I am always happy to talk about GC and there are links to all
 of the papers and references I used for this talk at this URL and I hope you
 enjoy the rest of Rubik thank you very much [Applause]
