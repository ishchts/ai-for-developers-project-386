import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";
import "./owner.tsp";
import "./guest.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{ title: "Call Booking Service" })
@server("http://localhost:8080", "Local development server")
namespace CallBookingService;
