package controllers

import common.Logging
import conf.Configuration.commercial.prebidAnalyticsStream
import conf.Configuration.environment.isProd
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached, TinyResponse}
import play.api.libs.json.Json
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

import scala.concurrent.ExecutionContext
import scala.util.control.NonFatal
import commercial.model.data.Firehose
import conf.switches.Switch

class CommercialDataController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  private val streamName:String = ???

  private val stream = Firehose.stream(streamName) _

  private val s:Switch = ???

  def insertConsentData(pageViewId:String): Action[String] = Action(parse.text) { implicit request =>
    if (s.isSwitchedOn) {
      val consentData = request.body
      if (isProd) {
        val result = stream(consentData)
        result.failed foreach {
          case NonFatal(e) => log.error(s"Failed to put '$consentData'", e)
        }
      } else log.info(prettyPrint(Json.parse(consentData)))
      TinyResponse.noContent()
    } else
      Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
  }
}
