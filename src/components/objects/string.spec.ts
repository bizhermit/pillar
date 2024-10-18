import { isMailAddress } from "./string";

describe("string", () => {
  describe("mail address", () => {
    it("null", () => {
      expect(isMailAddress(null)).toBe(false);
    });
    it("blank", () => {
      expect(isMailAddress("")).toBe(false);
    });

    const truthy = [
      `simple@example.com`,
      `very.common@example.com`,
      `disposable.style.email.with+symbol@example.com`,
      `other.email-with-dash@example.com`,
      `"much.more unusual"@example.com`,
      `"very.unusual.@.unusual.com"@example.com`,
      `"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com`,
      `example@s.solutions`,
      `user@[IPv6:2001:db8::1]`,
      `1234567890@example.com`,
      `user.name+tag+sorting@example.com`,
      `x@example.com`,
      `example-indeed@strange-example.com`,
      `test/test@test.com`,
      `mailhost!username@example.org`,
      `user%example.com@example.org`,
      `Abc@example.com`,
      `Abc.123@example.com`,
      `user+mailbox/department=shipping@example.com`,
      "!#$%&'*+-/=?^_`.{|}~@example.com",
      `"Abc@def"@example.com`,
      `"Fred\ Bloggs"@example.com`,
      `"Joe.\\Blow"@example.com`,
      //
      // `email@example.com`,
      // `firstname.lastname@example.com`,
      // `email@subdomain.example.com`,
      // `firstname+lastname@example.com`,
      // `email@123.123.123.123`,
      // `email@[123.123.123.123]`,
      // `"email"@example.com`,
      // `1234567890@example.com`,
      // `email@example-one.com`,
      // `_______@example.com`,
      // `email@example.name`,
      // `email@example.museum`,
      // `email@example.co.jp`,
      // `firstname-lastname@example.com`,
      // `much."more\ unusual"@example.com`,
      // `very.unusual."@".unusual.com@example.com`,
      // `very."(),:;<>[]".VERY."very@\\ "very".unusual@strange.example.com`,
    ];
    for (const str of truthy) {
      it(str, () => {
        expect(isMailAddress(str)).toBe(true);
      });
    }

    const falsy = [
      `plainaddress`,
      `@missingusername.com`,
      `username@.com`,
      `username@.com.`,
      `username@.invalid-.com`,
      `username@example,com`,
      `username@example..com`,
      `.username@example.com`,
      `username@example..double-dot.com`,
      `username@-example.com`,
      `username@example.com-`,
      `username@mailserver1`,
      `username@111.222.333.44444`,
      `missingatsymbol.com`,
      `username@-example-.com`,
      `username@example@com`,
      `username@.startwithdot.com`,
      `username@start.with.dot..`,
      `"username"example.com`,
      `username@example.c`,
      `user@.localhost.localdomain`,
      `üñîçøðé@example.com`,
      `"this is\"not\\allowed@example.com"`,
      `"this\ still\"not\\allowed@example.com"`,
      //
      // `plainaddress`,
      // `#@%^%#$@#$@#.com`,
      // `@example.com`,
      // `Joe Smith <email@example.com>`,
      // `email.example.com`,
      // `email@example@example.com`,
      // `.email@example.com`,
      // `email.@example.com`,
      // `email..email@example.com`,
      // `あいうえお@example.com`,
      // `email@example.com (Joe Smith)`,
      // `email@example`,
      // `email@-example.com`,
      // // `email@example.web`,
      // `email@111.222.333.444`,
      // `email@111.222.333.44444`,
      // `email@example..com`,
      // `Abc..123@example.com`,
      // `"(),:;<>[\]@example.com`,
      // `just"not"right@example.com`,
      // `this\ is"really"not\allowed@example.com`,
      // `abcd.@example.com`,
      // `ab--..cd@example.com`,
      // `.abcd@example.com`,
      // `ab@cd@example.com`,
      // `ab[cd@example.com`,
    ];
    for (const str of falsy) {
      it(str, () => {
        expect(isMailAddress(str)).toBe(false);
      });
    }
  });
});
