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

  @patch
  @route("/{eventTypeId}")
  @doc("Обновить существующий тип события")
  update(
    @path eventTypeId: string,
    @body request: UpdateEventTypeRequest
  ): {
    @statusCode statusCode: 200;
    @body eventType: EventType;
  } | BadRequestError | NotFoundError;

  @delete
  @route("/{eventTypeId}")
  @doc("Удалить тип события")
  delete(
    @path eventTypeId: string
  ): {
    @statusCode statusCode: 200;
    @body eventType: EventType;
  } | BadRequestError | NotFoundError;
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

  @get
  @route("/search")
  @doc("Получить список бронирований с фильтрацией по статусу и пагинацией")
  search(
    @query status?: "upcoming" | "past",
    @query page?: int32,
    @query pageSize?: int32
  ): {
    @statusCode statusCode: 200;
    @body result: PaginatedBookings;
  } | BadRequestError;

  @patch
  @route("/{bookingId}")
  @doc("Обновить бронирование")
  update(
    @path bookingId: string,
    @body request: UpdateBookingRequest
  ): {
    @statusCode statusCode: 200;
    @body booking: Booking;
  } | BadRequestError | NotFoundError | ConflictError;

  @delete
  @route("/{bookingId}")
  @doc("Удалить бронирование")
  delete(
    @path bookingId: string
  ): {
    @statusCode statusCode: 200;
    @body booking: Booking;
  } | NotFoundError;
}
