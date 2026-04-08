import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace CallBookingService.Owner;

// ============ Event Types Management ============
@route("/owner/event-types")
interface EventTypes {
  @post
  @doc("Создать новый тип события")
  create(
    @body request: CreateEventTypeRequest
  ): {
    @statusCode statusCode: 201;
    @body eventType: EventType;
  } | BadRequestError;
}

// ============ Bookings View ============
@route("/owner/bookings")
interface Bookings {
  @get
  @doc("Получить список будущих бронирований (startTime > now)")
  listFuture(): {
    @statusCode statusCode: 200;
    @body bookings: Booking[];
  };
}
