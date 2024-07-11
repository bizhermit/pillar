declare namespace DataItem {

  type CrossProps<U> = Pick<U, keyof U>;

  type UnionToIntersection<A> = (A extends any ? (_: A) => void : never) extends ((_: infer B) => void) ? B : never;

  type Prop<D extends $object> = D extends $object ? D["required"] extends true ? { [P in D["name"]]: ValueType<D> } : { [P in D["name"]]?: ValueType<D> } : never;

  type Props<A extends Array<$object>> = CrossProps<UnionToIntersection<Prop<A[number]>>>;

  type NullValue = null | undefined;

  type PartialRequired<V, R extends $object["required"]> = R extends true ? V : V | NullValue;

  type ValueType<D extends $object> =
    D extends { name: string; type: infer T; } ? (
      PartialRequired<
        D extends { source: infer S } ? SourceValueType<D> :
        D extends { trueValue: infer True; falseValue: infer False; } ? True | False :
        T extends "str" ? string :
        T extends "num" ? number :
        T extends "bool" ? boolean :
        T extends "date" ? string :
        T extends "month" ? string :
        T extends "time" ? number :
        T extends "file" ? File :
        T extends "array" ? Array<D["item"] extends Array<$object> ? Props<D["item"]> : ValueType<D["item"]>> :
        T extends "struct" ? Props<D["item"]> :
        any, D["required"]>
    ) : any;

  type Source<T> = Array<{ value?: T | NullValue; label?: string; } & { [v: string]: any }>;

  type SourceValueType<D extends $object> = D extends { source: infer S } ? (S extends Array<infer V> ? V["value"] : any) : any;

  type ValidationResult = {
    type: "e" | "w" | "i";
    code: string;
    msg: string;
    fullName: string;
  };

  type OmitableProps = "name";

  type ArgObject<D extends $object> = PickPartial<D, OmitableProps>;

  type Validation<D extends $object> = (props: {
    value: ValueType<D> | null | undefined;
    data: { [v: string | number]: any } | null | undefined;
    siblings: Array<ArgObject<$object>> | Readonly<Array<ArgObject<$object>>> | null | undefined;
    dataItem: ArgObject<D>;
    fullName: string;
  }) => (ValidationResult | null | undefined);

  type ParseProps<D> = {
    value: any;
    dataItem: ArgObject<D>;
    fullName: string;
  };

  type ParseResult<V> = [parsedValue: V | NullValue, result?: ValidationResult];

  type $ = {
    name: string;
    label?: string;
    required?: boolean;
  };

  type $str<V extends string = string> = $ & {
    type: "str";
    source?: Source<V>;
    validations?: Array<Validation<$str<V>>>;
    length?: number;
    minLength?: number;
    maxLength?: number;
    charType?:
    | "int"
    | "h-num"
    | "f-num"
    | "num"
    | "h-alpha"
    | "f-alpha"
    | "alpha"
    | "h-alpha-num"
    | "h-alpha-num-syn"
    | "h-katanaka"
    | "f-katakana"
    | "katakana"
    | "hiragana"
    | "half"
    | "full"
    | "email"
    | "tel"
    | "url"
    ;
    inputMode?: React.HTMLAttributes<React.HTMLInputElement>["inputMode"];
  };

  type $num<V extends number = number> = $ & {
    type: "num";
    source?: Source<V>;
    validations?: Array<Validation<$num<V>>>;
    min?: number;
    max?: number;
    maxLength?: number;
    float?: number;
    requiredIsNotZero?: boolean;
  };

  type $bool<True extends boolean = true, False extends boolean = false> = $ & {
    type: "bool";
    trueValue: True;
    falseValue: False;
    source?: Source<True | False>;
    validations?: Array<Validation<$bool<True, False>>>;
    requiredIsTrue?: boolean;
  };

  type $boolNum<True extends number = 1, False extends number = 0> = $ & {
    type: "b-num";
    trueValue: True;
    falseValue: False;
    source?: Source<True | False>;
    validations?: Array<Validation<$boolNum<True, False>>>;
    requiredIsTrue?: boolean;
  };

  type $boolStr<True extends string = "1", False extends string = "0"> = $ & {
    type: "b-str";
    trueValue: True;
    falseValue: False;
    source?: Source<True | False>;
    validations?: Array<Validation<$boolStr<True, False>>>;
    requiredIsTrue?: boolean;
  };

  type $boolAny<True extends any = any, False extends any = any> =
    True extends boolean ? $bool<True, False> :
    True extends number ? $boolNum<True, False> :
    True extends string ? $boolStr<True, False> :
    $bool<True, False>;

  type $date = $ & {
    type: "date";
    validations?: Array<Validation<$date>>;
    min?: string;
    max?: string;
    pair?: {
      name: string;
      position: "before" | "after";
      same?: boolean;
    };
  };

  type $month = $ & {
    type: "month";
    validations?: Array<Validation<$month>>;
    min?: string;
    max?: string;
    pair?: {
      name: string;
      position: "before" | "after";
      same?: boolean;
    };
  };

  type $time = $ & {
    type: "time";
    mode?: "hms" | "hm" | "ms";
    validations?: Array<Validation<$time>>;
    min?: number;
    max?: number;
    pair?: {
      name: string;
      position: "before" | "after";
      same?: boolean;
    };
  };

  type $file = $ & {
    type: "file";
    validations?: Array<Validation<$file>>;
    accept?: string;
    fileSize?: number;
    fileName?: string;
  };

  type $array<T extends $atoms | $array<any> | Array<$object>> = $ & {
    type: "array";
    item: Readly<T>;
    validations?: Array<Validation<$array<T>>>;
    length?: number;
    minLength?: number;
    maxLength?: number;
  };

  type $struct<T extends Array<$object>> = $ & {
    type: "struct";
    item: Readonly<T>;
    validations?: Array<Validation<$struct<T>>>;
  };

  type $atoms =
    | $str
    | $num
    | $boolAny
    | $date
    | $month
    | $time
    | $file
    ;

  type $object = $atoms | $array<$atoms | $array<any> | Array<$object>> | $struct<Array<$object>>;

}
