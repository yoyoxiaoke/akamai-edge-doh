export class ICache {
  params;
  key;
  value="";

  // constructor...
  constructor(request, domain) {
    const { userLocation } = request;
    const country = userLocation.country || "N/A";
    const city = userLocation.city || "N/A";
    this.params = {
      country,
      city,
      domain
    };
    this.key = country + city + domain.split(".").join("");
  }

  updateTtl(value, defaultTTL = 0) {
    if (!value) {
      this.value = "";
      return;
    }

    const { dns, timestamp } = value;
    if (!dns) {
      this.value = "";
      return;
    }
    const now = Date.parse(new Date()) / 1000;
    const { Answer } = dns;
    const newTtl = now - timestamp;
    if (Answer.length > 0 && newTtl < Answer[0].TTL) {
      const newAnswer = Answer.map(item => ({
        ...item,
        TTL: defaultTTL ? defaultTTL : item.TTL - newTtl,
      }));
      this.value = {
        ...dns,
        Answer: newAnswer,
      };
      return;
    }
  }
}