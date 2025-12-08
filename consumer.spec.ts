import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  SpecificationVersion,
  PactV3,
  LogLevel,
  MatchersV3,
} from "@pact-foundation/pact";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Pact Consumer Test", () => {
  const pact = new PactV3({
    consumer: "myconsumer",
    provider: "myprovider",
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    logLevel: "trace",
  });

  it("creates a pact to verify", async () => {
    const formData = new FormData();
    formData.append("name", "John Doe");
    const res = new Response(formData);
    const txt = await res.text();
    const headers = Object.fromEntries(res.headers.entries());
    await pact
      .addInteraction({
        uponReceiving: "a request for a foo",
        withRequest: {
          method: "POST",
          path: "/test",
          body: txt,
          headers
        },
        willRespondWith: {
          status: 201,
          body: {
            foo: MatchersV3.like("bar"),
          },
        },
      })
      .executeTest(async (mockServer) => {        
        const response = await fetch(`${mockServer.url}/test`, {
          method: "POST",
          body: txt,
          headers
        });
        const data = await response.json();

        expect(data.foo).to.equal("bar");
      });
  });
});
