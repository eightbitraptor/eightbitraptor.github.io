---
layout: post
title: "A typing journey, part 2: Down the rabbit hole"
date: 2020-03-11 08:34:17 +0000
categories: keyboards
---

In my last post about mechanical keyboards, I was getting ready to dip my toe
into the weird and wonderful world of custom ergonomic keyboards. Young and full
of naïvete I hadn't fully grasped the depth of the hobby I was about to pick up,
nor quite how tight it would grab me!

Fast forward a few months, and in addition to owning and using [my bamboo
Redox](https://falba.tech/custom-redox/) every day, I've also:

- Dissassembled it to lubricated all the switches with a locally sourced
  alternative to Krytox 205g0 (a very popular grease in "the keyboard
  community", but expensive and hard to find outside the US);
- Built a 40% ergonomic keyboard ([the Crkbd, or Corne
  keyboard](https://github.com/foostan/crkbd) an open source project from Japan)
- Joined a keyboard "group-buy" for a set of [limited run custom
  keycaps](https://geekhack.org/index.php?topic=104129.0) which I am waiting to
  receive
- And I'm about 70% of the way towards designing and building my own custom
  keyboard from scratch, and it's this project that I want to talk about in the
  next few posts.

<div class='centered-image'>
  <img alt="Boy, that escalated quickly" src="/images/escalation.gif">
</div>

For something so innocuous and generally overlooked as the keyboard attached to
your computer, the depths some folks go to in search of perfection (or the "end
game") are staggering.

I've learned an awful lot since I started this adventure. As well as basic
knowledge about keyboards, their history and all the different variations that
exist around the world, I've also learned how they're made. I've spent time
writing and customising the source code that runs on my keyboards (contributing
to open source in the process), I've learned how to use [AutoDesk Fusion 360]()
to do 3D modelling and CAD, both for CNC machining purposes and for 3D printing,
I've also relearned how to design electronics schematics, convert those into
printed circuit board designs and how to manufacture electronics, none of which
I've had cause to do since finishing my BSc 15 years ago!

![My current keyboards](/images/current_keyboards_feb20.jpeg)

## Background. Or, Why am I building a keyboard

There are a few ways in which you can go deep into the mechanical keyboards
hobby, and one of the ways that immediately captured my interest is the high-end
custom keyboard scene. These are keyboards that have been designed from the
ground up by individual people, mostly sold in kit form (so you can customise it
with your own choice of switches and keycaps), manufactured in a small quanitity
out of premium materials, and funded up front in a process called a "group buy".

A group buy typically goes like this:

Someone has an idea for a new keyboard, they put together a design in a cad
package, maybe a few renders and they write a bit about what they want to do.
They post up an "Interest check", or IC thread on a keyboard community forum
like Geekhack.

People comment on the thread, generally expressing interest, intent to buy or
design suggestions. This kicks off an iterative process where the original
designer might incorporate feedback into the idea, or clarify their thinking in
certain ways. At this point either the hype begins, or an idea fizzles out and
dies.

Assuming the hype train is well and truly picking up steam, the designer will
then start approaching manufacturing companies to try and get an idea of what
the costs for a manufacturing run would be, what the minimum order quantity is
and how that is going to affect the cost. They will probably also order one or
more prototypes at this stage to check the feasibility of the design. The
prototypes will then allow them to refine further to make manufacturing easier
or more cost effective.

At this point a designer will generally know what the final design is, how it's
going to be manufactured, what all the options are as well as their retail price
and how many they need to sell in order to make that price achievable. They'll
probably also have some accaurate renders of the finished product and maybe a
prototype or two that they can show off. At this point they'll generally start
trying to find "proxies" to sell their product.

Because this whole process is not uncommon in the mechanical keyboard world, a
lot of the [community](https://novelkeys.xyz/collections/group-buys)
[favourite](https://mykeyboard.eu/catalogue/category/group-buys_20/)
[retailers](https://candykeys.com/group-buys) will often manage sales of a group
buy product, for a small fee. This is referred to as being a proxy.

This means that a customer can place an order for the product as they would do
normally for any other in-stock item on that store, but instead of having
something shipped to them immediately, the money is taken and held in escrow by
the proxy. This allows the designer to have confidence that the money is there
and that the group buy customers are committed (typically proxies for group buys
don't allow refunds), and it also gives the customers some security because
they're paying via credit card or paypal to an actual business, rather than
transferring money to some rando on the internet.

Once the proxies have been set up, then the action happens. The designer posts a
Group Buy (or GB) thread on the same forum where they opened their IC. They post
all the details of the product, as well as the options available, the pricing
scheme and links to the proxies where you can go to place your order, and
they'll typically specify a date that the group buy will "open" or be available
for purchase.

Group buy sales typically stay "open" on the proxies either until a desired
quantity has been purchased, or they stay open for a set time window. This is
another critical point in the lifecycle of a group buy. If not enough units sell
to hit the factory specified MOQ then the group buy dies, the proxies refund the
money to the buyers and the designer goes back to the drawing board.

A lot of the time, MOQ's are hit quite quickly - for some of the more well known
and respected group buy runners this will be in the order of a few minutes. Once
the MOQ has been hit, the buyer has nothing left to do but wait for their
purchase to arrive. But for the designer, it's crunch time. They've got to work
with the manufacturing companies to get cases built and finished, PCB's
manufactured and built, and get everything packaged up and shipped to the buyers.

This process will take months at best, and can often take a lot longer than
expected owing to unforseen manufacturing issues, delays, and quality control
issues (my keyset group buy closed at the end of January 2020, and I will
consider myself lucky if I receive them in July).

![A very elegant render of the KAT Lich keycap set](/images/kat_lich_render.jpg)

All in all it's not uncommon for a group buy to take 12-18 months from initial
interest check to actually receiving a kit that you can build.

These methods of manufacturing and distribution generally mean that there's a
lot of hype around these keyboards and they're very hard to get. Minimum order
quantities aren't high, GB runs are mostly for < 50 keyboards and because the
interest checks are started so far in advance there is usually a lot of people
fighting for any keyboard that's made it to manufacturing stage.

The intense design process and small scale means that these keyboards are often
very expensive, most commonly around the $400-$600 USD price bracket once you
take into account various options, shipping and customs charges. So if you can
get one, they're often used a status symbol, and all these factors have
translated into a cut-throat and massively inflated second hand market, where
it's not uncommon to see popular designs changing hands for $2000 USD and
upwards.

## Where do I fit in

I have been following the custom keyboard scene for a while, and I really wanted
to get one. I love the idea of having a heavy weight premium keyboard that
sounds and feels great to type on, and has some exclusivity to it. I also fell
in love with [the Kyuu keyboard](https://geekhack.org/index.php?topic=97810.0),
but that is ancient history in terms of keyboard group buys having been shipped
way back in 2018.

![the Kyuu 65% keyboard](/images/kyuu.jpg)

So I was lurking over group buys and interest checks and waiting to see if
anything caught my eye enough to want to drop several hundred pounds on it. I
even bought a set of keycaps intended for a keyboard I didn't yet own (the KAT
Lich group buy that I've mentioned above).

During this time I stumbled upon [this Reddit post where a user called vitaport
talks about a personal keyboard that they've designed and
manufactured](https://www.reddit.com/r/CustomKeyboards/comments/eoq1u8/a_simple_wedge/).
Suddenly a bunch of neurons that had been slowly idling suddenly fired up and
connected. All these keyboards are built by individual humans, there's nothing
special about people that run group buys and if you're going to design a
keyboard you don't _have_ to run a group buy. You could just do what vitaport
has done and make your own personal keyboard. I have a background in electronic
engineering, and I'm a professional software developer, surely I can dredge up
enough memories to put together some circuitry, and it's not beyond me to learn
how to build a keyboard case!

I was excited.

Instead of just plonking down a load of cash and receiving a keyboard in the
mail, I would plonk down a load of cash, learn a bunch of new skills and end up
with a keyboard that is truly mine and truly exclusive. This sounded immensely
satisfying to me.

So I did some digging, and found out that once you scratch the surface of the
mechanical keyboard community, scrape off the layer of drama and flippers and
superficiality, you reach a really solid core. Full of people who are friendly,
helpful and excited to share resources and tips on how to get from a blank peice
of paper to an actual real keyboard that you can type on. There's lots of
overlap with maker culture and a real DIY aesthetic, and I'm having loads of
fun.

I'm doing the project in the open on Github. I had originally wanted the
repository to be self contained and have everything you needed in it to follow
along with the process using the Git history, but unfortunately my discipline
with personal projects isn't quite up to the stringent standards I set for
myself at work, so the history is a mess.

So I decided to write a series of posts about the journey, to explain how I am
making a custom keyboard. This is part one, a basic introduction to what I'm
doing and why. In part 2 I'll talk about how I got started, what the anatomy of
a custom keyboard looks like, and what the first steps were.

<div class="centered">
  <h4>
    <a href="https://github.com/eightbitraptor/65_keyboard_untitled">See eightbitraptor's 65% Untitled Keyboard repository on Github</a>
  </h4>
</div>
