import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace CallBookingService.Guest;

// ============ Event Types (read-only) ============
@route("/event-types")
interface EventTypes {
  @get
  @doc("Получить список всех типов событий")
  list(): {
    @statusCode statusCode: 200;
    @body eventTypes: EventType[];
  };
}

// ============ Slots ============
@route("/event-types/{eventTypeId}/slots")
interface Slots {
  @get
  @doc("Получить свободные слоты для типа события на указанную дату (YYYY-MM-DD)")
  list(
    @path eventTypeId: string,
    @query date: string
  ): {
    @statusCode statusCode: 200;
    @body slots: Slot[];
  } | NotFoundError | BadRequestError;
}

// ============ Bookings (create) ============
@route("/bookings")
interface Bookings {
  @post
  @doc("Создать бронирование. Возвращает 409 если время занято (даже для другого типа события)")
  create(
    @body request: CreateBookingRequest
  ): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | ConflictError | BadRequestError | NotFoundError;
}
