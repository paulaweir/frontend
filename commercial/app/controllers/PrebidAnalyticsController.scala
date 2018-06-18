package commercial.controllers

import commercial.model.data.Firehose
import common.Logging
import conf.Configuration.commercial.prebidAnalyticsStream
import conf.Configuration.environment.isProd
import conf.switches.Switches.prebidAnalytics
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached, TinyResponse}
import play.api.libs.json.Json
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.util.control.NonFatal

class PrebidAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  private val streamAnalytics = Firehose.stream(prebidAnalyticsStream) _

  def insert(): Action[String] = Action(parse.text) { implicit request =>
    if (prebidAnalytics.isSwitchedOn) {
      val analytics = request.body
      if (isProd) {
        val result = streamAnalytics(analytics)
        result.failed foreach {
          case NonFatal(e) => log.error(s"Failed to put '$analytics'", e)
        }
      } else log.info(prettyPrint(Json.parse(analytics)))
      TinyResponse.noContent()
    } else
      Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
  }
}
