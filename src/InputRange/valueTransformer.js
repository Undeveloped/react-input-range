/**
 * @module InputRange/valueTransformer
 */

import { clamp, isEmpty, isNumber, objectOf } from './util';

/**
 * Convert percentage into logarithmic value
 * @method logValueFromPercentage
 * @param {InputRange} inputRange
 * @param {Point} position
 * @return {number} Logarithmic value
 */
function logValueFromPercentage(inputRange, perc) {
  // perc will be between 0 and 100
  const minp = 0;
  const maxp = 100;

  if (!perc) { return 0; }

  // The result should be between min and max
  const minv = Math.log(inputRange.props.minValue || 1);
  const maxv = Math.log(inputRange.props.maxValue);

  // calculate adjustment factor
  const scale = (maxv - minv) / (maxp - minp);

  return Math.exp(minv + scale * (perc - minp));
}

/**
 * Convert position into percentage value
 * @static
 * @param {InputRange} inputRange
 * @param {Point} position
 * @return {number} Percentage value
 */
function percentageFromPosition(inputRange, position) {
  const length = inputRange.trackClientRect.width;
  const sizePerc = position.x / length;

  return sizePerc || 0;
}

/**
 * Convert position into model value
 * @static
 * @param {InputRange} inputRange
 * @param {Point} position
 * @return {number} Model value
 */
function valueFromPosition(inputRange, position) {
  const sizePerc = percentageFromPosition(inputRange, position);
  const valueDiff = inputRange.props.maxValue - inputRange.props.minValue;
  if (inputRange.props.logScale) { return logValueFromPercentage(inputRange, sizePerc * 100); }
  const value = inputRange.props.minValue + valueDiff * sizePerc;

  return value;
}

/**
 * Extract values from props
 * @static
 * @param {InputRange} inputRange
 * @param {Point} [props=inputRange.props]
 * @return {Range} Range values
 */
function valuesFromProps(inputRange, { props } = inputRange) {
  if (inputRange.isMultiValue) {
    let values = props.value;

    if (isEmpty(values) || !objectOf(values, isNumber)) {
      values = props.defaultValue;
    }

    return Object.create(values);
  }

  const value = isNumber(props.value) ? props.value : props.defaultValue;

  return {
    min: props.minValue,
    max: value,
  };
}

/**
 * Convert logarithmic value into percentage value
 * @method percentageFromLogValue
 * @param {InputRange} inputRange
 * @param {number} value
 * @return {number} Percentage value
 */
function percentageFromLogValue(inputRange, value) {
  // The result should be between 0 and 100
  const minp = 0;
  const maxp = 1;

  if (!value) { return 0; }

  // value will be between min and max
  const minv = Math.log(inputRange.props.minValue || 1);
  const maxv = Math.log(inputRange.props.maxValue);

  // calculate adjustment factor
  const scale = (maxv - minv) / (maxp - minp);

  return (Math.log(value) - minv) / scale + minp;
}

/**
 * Convert value into percentage value
 * @static
 * @param {InputRange} inputRange
 * @param {number} value
 * @return {number} Percentage value
 */
function percentageFromValue(inputRange, value) {
  const validValue = clamp(value, inputRange.props.minValue, inputRange.props.maxValue);
  const valueDiff = inputRange.props.maxValue - inputRange.props.minValue;
  const valuePerc = (validValue - inputRange.props.minValue) / valueDiff;
  if (inputRange.props.logScale) { return percentageFromLogValue(inputRange, value); }

  return valuePerc || 0;
}

/**
 * Convert values into percentage values
 * @static
 * @param {InputRange} inputRange
 * @param {Range} values
 * @return {Range} Percentage values
 */
function percentagesFromValues(inputRange, values) {
  const percentages = {
    min: percentageFromValue(inputRange, values.min),
    max: percentageFromValue(inputRange, values.max),
  };

  return percentages;
}

/**
 * Convert value into position
 * @static
 * @param {InputRange} inputRange
 * @param {number} value
 * @return {Point} Position
 */
function positionFromValue(inputRange, value) {
  const length = inputRange.trackClientRect.width;
  const valuePerc = percentageFromValue(inputRange, value);
  const positionValue = valuePerc * length;

  return {
    x: positionValue,
    y: 0,
  };
}

/**
 * Convert a range of values into positions
 * @static
 * @param {InputRange} inputRange
 * @param {Range} values
 * @return {Object.<string, Point>}
 */
function positionsFromValues(inputRange, values) {
  const positions = {
    min: positionFromValue(inputRange, values.min),
    max: positionFromValue(inputRange, values.max),
  };

  return positions;
}

/**
 * Extract a position from an event
 * @static
 * @param {InputRange} inputRange
 * @param {Event} event
 * @return {Point}
 */
function positionFromEvent(inputRange, event) {
  const trackClientRect = inputRange.trackClientRect;
  const length = trackClientRect.width;
  const { clientX } = event.touches ? event.touches[0] : event;
  const position = {
    x: clamp(clientX - trackClientRect.left, 0, length),
    y: 0,
  };

  return position;
}

/**
 * Convert a value into a step value
 * @static
 * @param {InputRange} inputRange
 * @param {number} value
 * @return {number} Step value
 */
function stepValueFromValue(inputRange, value) {
  return Math.round(value / inputRange.props.step) * inputRange.props.step;
}

export default {
  percentageFromPosition,
  percentageFromValue,
  percentagesFromValues,
  positionFromEvent,
  positionFromValue,
  positionsFromValues,
  stepValueFromValue,
  valueFromPosition,
  valuesFromProps,
};
