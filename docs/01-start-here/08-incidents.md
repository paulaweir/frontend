# Incident Response & Triage

What do when everything breaks

The scope of this document is to prescribe a generic pattern of investigation tools and 
techniques for finding the cause of issues with the Frontend stack.

## Sources of Truth

All of our Frontend metrics, alerts and monitoring are available in two places: 

* [CloudWatch](https://eu-west-1.console.aws.amazon.com/cloudwatch/) for health and performance metrics
* [Kibana](https://logs.gutools.co.uk/app/kibana) for application logs

You may also want to look at the [Fastly dashboard](https://manage.fastly.com/)

## Process and roles

Response to a potential site incidents will involve in general the following steps

1. Initial reaction
2. Determine which apps are affected
3. Investigate whether the affected apps are _slow_ or _failing_
4. Judge whether to scale up, roll back
5. Pinpoint an exact cause
6. Deploying a fix

Depending on the severity of the incident you should have a response team of
up to three people:

* One person should focus on communication with other parties and initial response
* One person should focus on the technical analysis of the problem
* One person should shadow and support the analyst

## Initial reaction

[Follow the P1 checklist for communications and process information](https://docs.google.com/document/d/1sAq378Oqm5NUG2_FJORDSd_Tag6gUUUsZaE9zUsgWHc/edit?usp=sharing)

## Determine which apps are affected

You will want to start by determining which Frontend apps are affected. You can 
see this from the overview boards. Pay close attention to the charts for 'errors by
app' and 'latency by app' in Kibana.

* [Kibana Overview Board](https://logs.gutools.co.uk/app/kibana#/dashboard/00349ef0-06a1-11e8-a56d-a31118fab969?_g=(refreshInterval%3A(display%3AOff%2Cpause%3A!f%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cmode%3Aquick%2Cto%3Anow)))
* [CloudWatch Overview Board](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=xOverview)

## Investigate whether the affected apps are _slow_ or _failing_

* [See the xApp CloudWatch dashboards](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:)

Errors and Latency are highly linked. When apps begin to return errors, Fastly
will make more requests to it, causing additional latency. When apps have high 
latency they will begin to return errors when they can no longer handle the level 
of incoming traffic.

Check what _kind_ of errors are contained in the Kibana logs for those apps. You 
may be able to see a large number of suspect stack traces that relate to a problem
with the app itself that point to a software problem.

Check whether REAL traffic is increasing to the app. As discussed above, Fastly 
itself will send more requests when apps start to return errors. You can use the
[Fastly Dashboard](https://manage.fastly.com/) along with the CloudWatch dashboard 
for the app in question to try to find this out.

Check the number of EC2 instances for the affected apps, and what state they are in. 
You can see this from the [CloudWatch overview board](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=xOverview) which has a chart for number of healthy/unhealthy 
instances over time. If there are no healthy instances the app may be failing to start.

## Judge whether to scale up, roll back

### Scaling Up

In nearly all cases, scaling up an app is a good interim solution to problems in
general. There are only two cases where you may not want to scale up: when apps
are failing to even start (new ec2 instances never become healthy), or when an upstream
or downstream dependency is the cause of your problems (in these cases scaling up
may cause that dependency to come under even more load).

If you are seeing an increase in REAL traffic (i.e. not just due to Fastly making 
more requests because your app is not returning 200s), you should scale up.

If instances are maxing their CPU (as seen in the xApp CloudWatch dashboards) you 
should scale up.

If you are seeing high latency, no application errors in particular, and new instances 
are coming up healthy, you should scale up.

### Rolling back

If you are seeing application errors in Kibana that point to a software bug, you should 
roll back by using Riff-Raff to deploy a previous build.

## Pinpoint an exact cause

* High traffic
    * cache misses? - look at fastly
    * major news event? - you probably already know about it
    * DDoS? - look at fastly and the Kibana overview board's source IP chart
* High latency, same traffic
    * Downstream or upstream dependency has become slow? - check CAPI dashboard
    * Latency regression has been introduced into app?

TODO

## Deploying a fix

TODO

