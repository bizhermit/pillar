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
      `_______@example.com`,
      `"quoted"@example.com`,
      `"much.more unusual"@example.com`,
      `much."more unusual"@example.com`,
      `"very.unusual.@.unusual.com"@example.com`,
      `very.unusual."@".unusual.com@example.com`,
      `"very.(),:;<>[]\\".VERY.\\"very@\\\\ \\"very\\".unusual"@strange.example.com`,
      `example@s.solutions`,
      `user@123.123.123.123`,
      `user@[123.123.123.123]`,
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
      `"User\\Name"@example.com`,
      `"User Name"@example.com`,
    ];
    for (const str of truthy) {
      it(str, () => {
        expect(isMailAddress(str)).toBe(true);
      });
    }

    const falsy = [
      `plainaddress`,
      `username.example.com`,
      `usrename <username@example.com>`,
      `"User Name@example.com`,
      `@missingusername.com`,
      `#@%^%#$@#$@#.com`,
      `user[name@example.com`,
      `username@.com`,
      `username@.com.`,
      `username@.invalid-.com`,
      `username@example,com`,
      `username@example..com`,
      `.username@example.com`,
      `username.@example.com`,
      `user..name@example.com`,
      `username@example..double-dot.com`,
      `username@-example.com`,
      `username@example-.com`,
      `username@example.com-`,
      `username@mailserver1`,
      `username@192.168.1.1111`,
      `username@192.168.1.256`,
      `missingatsymbol.com`,
      `username@-example-.com`,
      `username@example@com`,
      `username@.startwithdot.com`,
      `username@start.with.dot..`,
      `"username"example.com`,
      `username@example.c`,
      `user@.localhost.localdomain`,
      `あいうえお@example.com`,
      `üñîçøðé@example.com`,
      `"this is"not\\\\allowed@example.com"`,
      `"this\\ still\\"not\\\\allowed@example.com"`,
    ];
    for (const str of falsy) {
      it(str, () => {
        expect(isMailAddress(str)).toBe(false);
      });
    }
  });
});
