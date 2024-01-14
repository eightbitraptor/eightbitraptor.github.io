---
layout: page
title: Talks
---

<ul class="index-list">
  <% collections.talks.resources.each do |talk| %>
  <li>
    <a href="<%= talk.relative_url %>"><%= talk.data.title %></a>
    <span><%= date_to_long_string(talk.data.date) %>, 
      <a href="<%= talk.data.event_url %>"><%= talk.data.event %></a>, <%= talk.data.location %></span>
    <p><%= talk.data.abstract %></p>
  </li>
  <% end %>
</ul>

