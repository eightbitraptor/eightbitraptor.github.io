---
layout: page
title: Latest Weeknotes
---

<% latest_week = collections.weeknotes.resources.first %>
<article class="latest-weeknote">
  <header>
    <h2>
      <span class="meta">Week <%= latest_week.data.slug %>:</span>
      <a href="<%= absolute_url(latest_week) %>"><%= latest_week.data.title %></a>
    </h2>
    <div class="publised_on">
      Published on <%= date_to_long_string(latest_week.data.date) %>
    </div>
  </header>

  <section>
    <%= markdownify(latest_week.content) %>
  </section>
</article>

<section class="weeknote-archive">
  <header>
    <h1>Archive</h1>
  </header>
  <% yearly_weeknotes = collections.weeknotes.resources.group_by{ _1.data.slug.split('-').first }.compact %>
  <% yearly_weeknotes.each do |year, notes| %>
    <%= next if notes.size == 1 && notes.first.data.slug == latest_week.data.slug %>
    <section>
    <h2><%= year %>:</h2>
    <ul class="weeknote-list">
      <% notes.each do |note| %>
        <li>
          <a href="<%= note.relative_url %>"><%= note.data.slug.split('-').last %></a>
        </li>
      <% end %>
    </ul>
    </section>
  <% end %>
</section>
