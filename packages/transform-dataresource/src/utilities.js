/* @flow */

import numeral from "numeral";

export function numeralFormatting(d: number): string {
  return numeral(d).format("0.[000]a");
}

export function createLabelItems(uniqueValues: Array<string>): any[] {
  return uniqueValues.map(d => ({ label: d }));
}
