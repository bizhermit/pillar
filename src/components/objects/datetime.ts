class DateTime {

  private date: Date;
  private offset: number;

  constructor() {
    this.date = new Date();
    this.offset = this.date.getTimezoneOffset();
  }

  public getOrigin() {
    return this.date;
  }

  public setOrigin(date: Date) {
    this.date = date;
  }

  public getOffset() {
    return this.offset;
  }

  public setOffset(offset: number) {
    return this.offset = offset;
  }

  public getYear() {
    return this.date.getUTCFullYear();
  }

  public setYear(y: number) {
    this.date.setUTCFullYear(y);
  }

}

export default DateTime;
