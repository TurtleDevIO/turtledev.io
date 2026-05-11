---
title: 'JavaFX with Spring Boot Part-03: Advanced Integration'
description: 'Proper Spring Boot + JavaFX wiring using ApplicationContext, the init/stop lifecycle, and the StageReadyEvent pattern to decouple UI creation from application startup.'
date: '2022-04-18'
categories: ['javafx', 'spring', 'java']
published: true
readingTime: 5
---

<div class="table-of-contents">

### All articles in this series
1. [JavaFX with Spring Boot Part-01: Introduction](/blog/javafx-spring-boot-01)
2. [JavaFX with Spring Boot Part-02: Basic Integration](/blog/javafx-spring-boot-02)
3. JavaFX with Spring Boot Part-03: Advanced Integration
4. [JavaFX with Spring Boot Part-04: Using FXML](/blog/javafx-spring-boot-04)
5. [JavaFX with Spring Boot Part-05: FxWeaver Integration](/blog/javafx-spring-boot-05)

</div>


In the previous article, we've seen a basic/minimal integration of Spring boot with JavaFX. In this article we're going to see some extra wiring up to get the most out of Spring Boot.

## Creating the Application Context

In the previous article, we had extended JavaFX's `Application` abstract class by overriding its `start` method. `start` method and its `close` counter part are called on the UI thread. On the other hand the `init` method is called on a non-ui thread and the `start` is only called after the `init` method returns. This makes the `init` method the perfect place to create our `ApplicationContext`.

```java
  private ConfigurableApplicationContext context;

  @Override
  public void init() {
      ApplicationContextInitializer<GenericApplicationContext> initializer =
              context -> {
                  context.registerBean(Application.class, () -> JavaFxApp.this);
                  context.registerBean(Parameters.class, this::getParameters);
              };
      this.context = new SpringApplicationBuilder()
              .sources(SpringBootApp.class)
              .initializers(initializer)
              .run(getParameters().getRaw().toArray(new String[0]));
  }
```

## Closing the Application Context

According to the official docs, `stop` method "provides a convenient place to prepare for application exit and destroy resources". It is the right place to close the application context as well as to terminate the UI thread by calling `Platform.exit()`.


```java
  @Override
  public void stop() {
      this.context.close();
      Platform.exit();
  }
```

## Decoupling UI Creation Code from the Application Configuration Code

In the previous article, we had overridden the `start` method as follows. Since we only want application-wide initialization and termination related code in the `JavaFxApp` class, this is not ideal.

```java
 @Override
    public void start(Stage primaryStage) throws Exception {
        Pane helloPane = new Pane(new Label("Hello JavaFx"));
        primaryStage.setScene(new Scene(helloPane, 200, 100));
        primaryStage.show();
    }
```

Spring provides a great way of communication among components by firing events. We will be using this feature for various things in the upcoming articles. For now, let us make use of it to move the UI creation code in its own place. Since `start` method is called when the `stage` object is ready (in other words JavaFX application thread aka UI thread is ready), we want to publish an event in the `start` method and handle the event in some where else.

Let's first create an event class for our case.

```java
public class StageReadyEvent extends ApplicationEvent {

    @Getter
    private final Stage stage;

    public StageReadyEvent(Stage stage) {
        super(stage);
        this.stage = stage;
    }
}
```

Then create a `Listener` for this type of event. Since we'll be creating various events and listeners in the future, it is good the create a new package called `event` and put all events and their corresponding listeners there. Also, I highly recommend `XYZEvent` and `XYZEventListener` pattern for naming event and listener classes.

```java
@Component
public class StageReadyEventListener implements ApplicationListener<StageReadyEvent> {

    private final ApplicationContext applicationContext;
    private final String applicationTitle;

    public StageReadyEventListener(ApplicationContext applicationContext,
                                   @Value("${app.title}") String applicationTitle) {
        this.applicationTitle = applicationTitle;
        this.applicationContext = applicationContext;
    }


    @Override
    public void onApplicationEvent(StageReadyEvent event) {
        Stage stage = event.getStage();
        Pane helloPane = new Pane(new Label("Hello JavaFx"));
        stage.setScene(new Scene(helloPane, 200, 100));
        stage.setTitle(this.applicationTitle);
        stage.show();
    }
}
```

With `@Component` annotation, spring will take care of creating a `StageReadyEventListener` object for us. The `ApplicationContext` we've created in the `init` method will be injected into the constructor by Spring as well. Let's make use of another Spring goodie by defining a title for our application in the `application.properties` file.

```ini
app.title=Hello JavaFX with Spring Boot
```

As you can see, with the `@Value` annotation above, Spring will inject the value automatically for us. This way we can keep all application configuration in the `application.properties` and access them where ever we wan't. Isn't that cool? Note that we could do the same for the `Hello JavaFx` text of the `Label`. I'll leave it as an exercise for the reader.

Finally, lets publish the event in the `start` method.

```java
  @Override
  public void start(Stage primaryStage) throws Exception {
      this.context.publishEvent(new StageReadyEvent(primaryStage));
  }
```

We're ready to run our application. You should see something similar.

![spring initialz configuration](/images/posts/javafx-spring-boot-starter-03-01.png)


In the next article, we'll use `FXWeaver`.

Source code for this article can be found [here](https://github.com/harunzafer/javafx-spring-boot-starter/releases/tag/v0.3)
