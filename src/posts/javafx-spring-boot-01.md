---
title: 'JavaFX with Spring Boot Part-01: Introduction'
description: 'Why and how to use Spring Boot in a JavaFX desktop application. Covers dependency injection, profiles, events, and the motivation behind the series.'
date: '2022-04-14'
categories: ['javafx', 'spring', 'java']
published: true
readingTime: 3
---

<div class="table-of-contents">

### All articles in this series

1. JavaFX with Spring Boot Part-01: Introduction
2. [JavaFX with Spring Boot Part-02: Basic Integration](/blog/javafx-spring-boot-02)
3. [JavaFX with Spring Boot Part-03: Advanced Integration](/blog/javafx-spring-boot-03)
4. [JavaFX with Spring Boot Part-04: Using FXML](/blog/javafx-spring-boot-04)
5. [JavaFX with Spring Boot Part-05: FxWeaver Integration](/blog/javafx-spring-boot-05)

</div>

Around January 2021, I started working on the desktop client application for MagicAccents. After careful consideration, I build it with JavaFX. The reason in a nutshell was that Electron was too resource hungry for a thin client like this. Alternatives like [Tauri](https://tauri.studio/) was still in beta. And the last but not the least, I sucked at front-end development at the time whereas Java has always been an important part of my skill set.

Event though this was rather a simple application, after a while it felt like the code was getting messy. I had already considered some frameworks that are specific for desktop application development with JavaFX. However, none seemed good enough for me to worth the effort to learn them. On the other hand, I was already familiar with Spring Boot which I had really liked using for several REST API projects. Though, I wasn't even sure if it was even possible to use Spring Boot in a JavaFX desktop application.

After all Spring was an IoC container at its core and if I was able to use [Guice](https://github.com/google/guice) with the project, I should have been able to use Spring too. After a short investigation, I was happy to see that it was [possible](https://spring.io/blog/2019/01/16/spring-tips-javafx) indeed and there were even an awesome library called [FxWeaver](https://github.com/rgielen/javafx-weaver) which makes the integration much better.

At this point, I had already implemented 90% of the application and the question was whether it was worth migration effort. I told myself if this was going to help 4 or 5 of the following issues, it was worth it.

- dependency injection
- properties injection
- profiles: prod/dev
- events
- exception handling
- Logging

Finally, I decided to give it a try and by including FxWeaver into the mix, it helped with even more issues. So I decided to share my experience in a series. Another goal is to have a [javafx-spring-boot-starter](https://github.com/harunzafer/javafx-spring-boot-starter) template project at the end of the series.

This series is not meant to teach JavaFx or Spring but to show a modern, maintainable and a fun way of building desktop applications with JavaFX and Spring Boot in 2022 (and beyond). I will follow a step by step approach and focus on a particular aspect in each article. If you're not familiar with JavaFX here is a [good series of articles](https://www.vojtechruzicka.com/javafx-getting-started/) to get started.
