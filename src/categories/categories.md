---
layout: default
title: Posts in category :prototype-term
prototype:
  collection: posts
  term: categories
---

<ul class="index-list">
  <% paginator.resources.each do %>
  <li>
    <a href="<%= _1.absolute_url %>"><%= _1.data.title %></a>
    <span><%= date_to_long_string(_1.data.date) %></span>
  </li>
  <% end %>
</ul>
