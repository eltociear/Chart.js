import { BasePlatform } from '../platform';
import {
  Color,
  EasingFunction,
  IChartArea,
  IChartComponent,
  IFontSpec,
  IPoint,
  Scriptable,
  TimeUnit,
  IEvent,
} from './interfaces';
import { IChartDataset, IChartConfiguration, ConfigurationOptions, ConfigurationData } from '../interfaces';

export interface IDateAdapter {
  /**
   * Returns a map of time formats for the supported formatting units defined
   * in Unit as well as 'datetime' representing a detailed date/time string.
   * @returns {{string: string}}
   */
  formats(): { [key: string]: string };
  /**
   * Parses the given `value` and return the associated timestamp.
   * @param {any} value - the value to parse (usually comes from the data)
   * @param {string} [format] - the expected data format
   */
  parse(value: any, format?: TimeUnit): number | null;
  /**
   * Returns the formatted date in the specified `format` for a given `timestamp`.
   * @param {number} timestamp - the timestamp to format
   * @param {string} format - the date/time token
   * @return {string}
   */
  format(timestamp: number, format: TimeUnit): string;
  /**
   * Adds the specified `amount` of `unit` to the given `timestamp`.
   * @param {number} timestamp - the input timestamp
   * @param {number} amount - the amount to add
   * @param {Unit} unit - the unit as string
   * @return {number}
   */
  add(timestamp: number, amount: number, unit: TimeUnit): number;
  /**
   * Returns the number of `unit` between the given timestamps.
   * @param {number} a - the input timestamp (reference)
   * @param {number} b - the timestamp to subtract
   * @param {Unit} unit - the unit as string
   * @return {number}
   */
  diff(a: number, b: number, unit: TimeUnit): number;
  /**
   * Returns start of `unit` for the given `timestamp`.
   * @param {number} timestamp - the input timestamp
   * @param {Unit|'isoWeek'} unit - the unit as string
   * @param {number} [weekday] - the ISO day of the week with 1 being Monday
   * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
   * @return {number}
   */
  startOf(timestamp: number, unit: TimeUnit | 'isoWeek', weekday?: number): number;
  /**
   * Returns end of `unit` for the given `timestamp`.
   * @param {number} timestamp - the input timestamp
   * @param {Unit|'isoWeek'} unit - the unit as string
   * @return {number}
   */
  endOf(timestamp: number, unit: TimeUnit | 'isoWeek'): number;
}

export interface DateAdapter extends IDateAdapter {
  readonly options: any;
}

export const DateAdapter: {
  prototype: DateAdapter;
  new (options: any): DateAdapter;
  override(members: Partial<IDateAdapter>): void;
};

export const _adapters: {
  _date: DateAdapter;
};

export class Animation {
  constructor(cfg: any, target: any, prop: string, to?: any);
  active(): boolean;
  update(cfg: any, to: any, date: number): void;
  cancel(): void;
  tick(date: number): void;
}

export interface IAnimationEvent {
  chart: Chart;
  numSteps: number;
  currentState: number;
}

export class Animator {
  listen(chart: Chart, event: 'complete' | 'progress', cb: (event: IAnimationEvent) => void): void;
  add(chart: Chart, items: readonly Animation[]): void;
  has(chart: Chart): boolean;
  start(chart: Chart): void;
  running(chart: Chart): boolean;
  stop(chart: Chart): void;
  remove(chart: Chart): boolean;
}

export class Animations {
  constructor(chart: Chart, animations: {});
  configure(animations: {}): void;
  update(target: any, values: any): undefined | boolean;
}

export interface IAnimationCommonSpec {
  /**
   * The number of milliseconds an animation takes.
   * @default 1000
   */
  duration: number;
  /**
   * Easing function to use
   * @default 'easeOutQuart'
   */
  easing: EasingFunction;

  /**
   * Running animation count + FPS display in upper left corner of the chart.
   * @default false
   */
  debug: boolean;

  /**
   * Delay before starting the animations.
   * @default 0
   */
  delay: number;

  /**
   * 	If set to true, the animations loop endlessly.
   * @default false
   */
  loop: boolean;
}

export interface IAnimationPropertySpec extends IAnimationCommonSpec {
  properties: string[];

  /**
   * Type of property, determines the interpolator used. Possible values: 'number', 'color' and 'boolean'. Only really needed for 'color', because typeof does not get that right.
   */
  type: 'color' | 'number' | 'boolean';

  fn: <T>(from: T, to: T, factor: number) => T;

  /**
   * Start value for the animation. Current value is used when undefined
   */
  from: Color | number | boolean;
  /**
   *
   */
  to: Color | number | boolean;
}

export type IAnimationSpecContainer = IAnimationCommonSpec & {
  [prop: string]: IAnimationPropertySpec;
};

export type IAnimationOptions = IAnimationSpecContainer & {
  /**
   * Callback called on each step of an animation.
   */
  onProgress: (this: Chart, event: IAnimationEvent) => void;
  /**
   *Callback called when all animations are completed.
   */
  onComplete: (this: Chart, event: IAnimationEvent) => void;

  active: IAnimationSpecContainer;
  hide: IAnimationSpecContainer;
  reset: IAnimationSpecContainer;
  resize: IAnimationSpecContainer;
  show: IAnimationSpecContainer;
};

export interface IChartAnimationOptions {
  animation: Scriptable<IAnimationOptions>;
  datasets: {
    animation: Scriptable<IAnimationOptions>;
  };
}

export interface IChartMeta<E extends Element = Element, DSE extends Element = Element> {
  type: string;
  controller: DatasetController;
  order: number;

  label: string;
  index: number;
  visible: boolean;

  stack: number;

  indexAxis: 'x' | 'y';

  data: E[];
  dataset?: DSE;

  hidden: boolean;

  xAxisID?: string;
  yAxisID?: string;
  rAxisID?: string;
  iAxisID: string;
  vAxisID: string;

  xScale?: Scale;
  yScale?: Scale;
  rScale?: Scale;
  iScale?: Scale;
  vScale?: Scale;

  _sorted: boolean;
  _stacked: boolean;
  _parsed: any[];
}

export interface IParsingOptions {
  parsing:
    | {
        [key: string]: string;
      }
    | false;
}

export interface Chart<
  T = number,
  L = string,
  C extends IChartConfiguration<string, T, L> = IChartConfiguration<string, T, L>
> {
  readonly platform: BasePlatform;
  readonly id: string;
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly config: C;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly options: ConfigurationOptions<C>;
  readonly boxes: ILayoutItem[];
  readonly currentDevicePixelRatio: number;
  readonly chartArea: IChartArea;
  readonly data: ConfigurationData<C>;
  readonly scales: { [key: string]: Scale };
  readonly scale: Scale | undefined;
  readonly attached: boolean;

  clear(): this;
  stop(): this;

  resize(silent: boolean, width: number, height: number): void;
  ensureScalesHaveIDs(): void;
  buildOrUpdateScales(): void;
  buildOrUpdateControllers(): void;
  reset(): void;
  update(mode?: string): void;
  render(): void;
  draw(): void;

  getElementAtEvent(e: Event): InteractionItem[];
  getElementsAtEvent(e: Event): InteractionItem[];
  getElementsAtXAxis(e: Event): InteractionItem[];
  getElementsAtEventForMode(e: Event, mode: string, options: any, useFinalPosition: boolean): InteractionItem[];
  getDatasetAtEvent(e: Event): InteractionItem[];

  getSortedVisibleDatasetMetas(): IChartMeta[];
  getDatasetMeta(datasetIndex: number): IChartMeta;
  getVisibleDatasetCount(): number;
  isDatasetVisible(datasetIndex: number): boolean;
  setDatasetVisibility(datasetIndex: number, visible: boolean): void;
  toggleDataVisibility(index: number): void;
  getDataVisibility(index: number): boolean;
  hide(datasetIndex: number): void;
  show(datasetIndex: number): void;

  destroy(): void;
  toBase64Image(type?: string, quality?: any): string;
  bindEvents(): void;
  unbindEvents(): void;
  updateHoverStyle(items: Element, mode: 'dataset', enabled: boolean): void;
}

export declare type ChartItem =
  | string
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D
  | HTMLCanvasElement
  | OffscreenCanvas
  | { canvas: HTMLCanvasElement | OffscreenCanvas }
  | ArrayLike<CanvasRenderingContext2D | HTMLCanvasElement | OffscreenCanvas>;

export const Chart: {
  prototype: Chart;
  new <T = number, L = string, C extends IChartConfiguration<string, T, L> = IChartConfiguration<string, T, L>>(
    item: ChartItem,
    config: C
  ): Chart<T, L, C>;

  readonly version: string;
  readonly instances: { [key: string]: Chart };
  readonly registry: Registry;
  register(...items: IChartComponentLike[]): void;
  unregister(...items: IChartComponentLike[]): void;
};

export type UpdateMode = 'resize' | 'reset' | 'none' | 'hide' | 'show' | 'normal' | 'active' | undefined;

export class DatasetController<E extends Element = Element, DSE extends Element = Element> {
  constructor(chart: Chart, datasetIndex: number);

  readonly chart: Chart;
  readonly index: number;
  readonly _cachedMeta: IChartMeta<E, DSE>;
  enableOptionSharing: boolean;

  linkScales(): void;
  getAllParsedValues(scale: Scale): number[];
  protected getLabelAndValue(index: number): { label: string; value: string };
  updateElements(elements: E[], start: number, mode: UpdateMode): void;
  update(mode: UpdateMode): void;
  updateIndex(datasetIndex: number): void;
  protected getMaxOverflow(): boolean | number;
  draw(): void;
  reset(): void;
  getDataset(): IChartDataset;
  getMeta(): IChartMeta<E, DSE>;
  getScaleForId(scaleID: string): Scale | undefined;
  configure(): void;
  initialize(): void;
  addElements(): void;
  buildOrUpdateElements(): void;

  getStyle(index: number, active: boolean): any;
  protected resolveDatasetElementOptions(active: boolean): any;
  protected resolveDataElementOptions(index: number, mode: UpdateMode): any;
  /**
   * Utility for checking if the options are shared and should be animated separately.
   * @protected
   */
  protected getSharedOptions(options: any): undefined | any;
  /**
   * Utility for determining if `options` should be included in the updated properties
   * @protected
   */
  protected includeOptions(mode: UpdateMode, sharedOptions: any): boolean;
  /**
   * Utility for updating an element with new properties, using animations when appropriate.
   * @protected
   */

  protected updateElement(element: E | DSE, index: number | undefined, properties: any, mode: UpdateMode): void;
  /**
   * Utility to animate the shared options, that are potentially affecting multiple elements.
   * @protected
   */

  protected updateSharedOptions(sharedOptions: any, mode: UpdateMode, newOptions: any): void;
  removeHoverStyle(element: E, datasetIndex: number, index: number): void;
  setHoverStyle(element: E, datasetIndex: number, index: number): void;

  parse(start: number, count: number): void;
  protected parsePrimitiveData(meta: IChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
  protected parseArrayData(meta: IChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
  protected parseObjectData(meta: IChartMeta<E, DSE>, data: any[], start: number, count: number): any[];
  protected getParsed(index: number): any;
  protected applyStack(scale: Scale, parsed: any[]): number;
  protected updateRangeFromParsed(
    range: { min: number; max: number },
    scale: Scale,
    parsed: any[],
    stack: boolean
  ): void;
  protected getMinMax(scale: Scale, canStack?: boolean): { min: number; max: number };
}

export interface IDatasetControllerChartComponent extends IChartComponent {
  defaults: {
    datasetElementType?: string | null | false;
    dataElementType?: string | null | false;
    dataElementOptions?: string[];
    datasetElementOptions?: string[] | { [key: string]: string };
  };
}

export interface Defaults {
  readonly color: string;
  readonly events: ('mousemove' | 'mouseout' | 'click' | 'touchstart' | 'touchmove')[];
  readonly font: IFontSpec;
  readonly hover: {
    onHover?: () => void;
    mode: InteractionMode | string;
    intersect: boolean;
  };
  readonly maintainAspectRatio: boolean;
  readonly onClick?: () => void;
  readonly responsive: boolean;

  readonly plugins: { [key: string]: any };
  readonly scale?: IScaleOptions;
  readonly doughnut: any;
  readonly scales: { [key: string]: IScaleOptions };
  readonly controllers: { [key: string]: any };

  set(scope: string, values: any): any;
  get(scope: string): any;
  /**
   * Routes the named defaults to fallback to another scope/name.
   * This routing is useful when those target values, like defaults.color, are changed runtime.
   * If the values would be copied, the runtime change would not take effect. By routing, the
   * fallback is evaluated at each access, so its always up to date.
   *
   * Example:
   *
   * 	defaults.route('elements.arc', 'backgroundColor', '', 'color')
   *   - reads the backgroundColor from defaults.color when undefined locally
   *
   * @param scope Scope this route applies to.
   * @param name Property name that should be routed to different namespace when not defined here.
   * @param targetScope The namespace where those properties should be routed to.
   * Empty string ('') is the root of defaults.
   * @param targetName The target name in the target scope the property should be routed to.
   */
  route(scope: string, name: string, targetScope: string, targetName: string): void;
}

export const defaults: Defaults;

export interface Element<T = {}, O = {}> {
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
  readonly options: O;

  tooltipPosition(useFinalPosition?: boolean): IPoint;
  hasValue(): boolean;
  getProps<P extends keyof T>(props: [P], final?: boolean): Pick<T, P>;
  getProps<P extends keyof T, P2 extends keyof T>(props: [P, P2], final?: boolean): Pick<T, P | P2>;
  getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T>(
    props: [P, P2, P3],
    final?: boolean
  ): Pick<T, P | P2 | P3>;
  getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T>(
    props: [P, P2, P3, P4],
    final?: boolean
  ): Pick<T, P | P2 | P3 | P4>;
  getProps<P extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T, P5 extends keyof T>(
    props: [P, P2, P3, P4, P5],
    final?: boolean
  ): Pick<T, P | P2 | P3 | P4 | P5>;
  getProps(props: (keyof T)[], final?: boolean): T;
}
export const Element: {
  prototype: Element;
  new <T = {}, O = {}>(): Element<T, O>;
};

export interface IInteractionOptions {
  axis?: string;
  intersect?: boolean;
}

export interface InteractionItem {
  element: Element;
  datasetIndex: number;
  index: number;
}

export type InteractionModeFunction = (
  chart: Chart,
  e: IEvent,
  options: IInteractionOptions,
  useFinalPosition?: boolean
) => InteractionItem[];

export interface IInteractionMode {
  /**
   * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
   * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
   */
  index: InteractionModeFunction;

  /**
   * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
   * If the options.intersect is false, we find the nearest item and return the items in that dataset
   */
  dataset: InteractionModeFunction;
  /**
   * Point mode returns all elements that hit test based on the event position
   * of the event
   */
  point: InteractionModeFunction;
  /**
   * nearest mode returns the element closest to the point
   */
  nearest: InteractionModeFunction;
  /**
   * x mode returns the elements that hit-test at the current x coordinate
   */
  x: InteractionModeFunction;
  /**
   * y mode returns the elements that hit-test at the current y coordinate
   */
  y: InteractionModeFunction;
}

export type InteractionMode = keyof IInteractionMode;

export const Interaction: {
  modes: IInteractionMode;
};

export type LayoutPosition = 'left' | 'top' | 'right' | 'chartArea';

export interface ILayoutItem {
  /**
   * The position of the item in the chart layout. Possible values are
   */
  position: LayoutPosition;
  /**
   * The weight used to sort the item. Higher weights are further away from the chart area
   */
  weight: number;
  /**
   * if true, and the item is horizontal, then push vertical boxes down
   */
  fullWidth: boolean;
  /**
   * returns true if the layout item is horizontal (ie. top or bottom)
   */
  isHorizontal(): boolean;
  /**
   * Takes two parameters: width and height. Returns size of item
   * @param width
   * @param height
   */
  update(width: number, height: number): number;

  /**
   * Draws the element
   */
  draw(): void;

  /**
   * Returns an object with padding on the edges
   */
  getPadding?(): IChartArea;

  /**
   *  Width of item. Must be valid after update()
   */
  width: number;
  /**
   * Height of item. Must be valid after update()
   */
  height: number;
  /**
   * Left edge of the item. Set by layout system and cannot be used in update
   */
  left: number;
  /**
   * Top edge of the item. Set by layout system and cannot be used in update
   */
  top: number;
  /**
   * Right edge of the item. Set by layout system and cannot be used in update
   */
  right: number;
  /**
   *  Bottom edge of the item. Set by layout system and cannot be used in update
   */
  bottom: number;
}

export const layouts: {
  /**
   * Register a box to a chart.
   * A box is simply a reference to an object that requires layout. eg. Scales, Legend, Title.
   * @param {Chart} chart - the chart to use
   * @param {ILayoutItem} item - the item to add to be laid out
   */
  addBox(chart: Chart, item: ILayoutItem): void;

  /**
   * Remove a layoutItem from a chart
   * @param {Chart} chart - the chart to remove the box from
   * @param {ILayoutItem} layoutItem - the item to remove from the layout
   */
  removeBox(chart: Chart, layoutItem: ILayoutItem): void;

  /**
   * Sets (or updates) options on the given `item`.
   * @param {Chart} chart - the chart in which the item lives (or will be added to)
   * @param {ILayoutItem} item - the item to configure with the given options
   * @param options - the new item options.
   */
  configure(
    chart: Chart,
    item: ILayoutItem,
    options: { fullWidth?: number; position?: LayoutPosition; weight?: number }
  ): void;

  /**
   * Fits boxes of the given chart into the given size by having each box measure itself
   * then running a fitting algorithm
   * @param {Chart} chart - the chart
   * @param {number} width - the width to fit into
   * @param {number} height - the height to fit into
   */
  update(chart: Chart, width: number, height: number): void;
};

export interface PluginService {
  /**
   * Calls enabled plugins for `chart` on the specified hook and with the given args.
   * This method immediately returns as soon as a plugin explicitly returns false. The
   * returned value can be used, for instance, to interrupt the current action.
   * @param {Chart} chart - The chart instance for which plugins should be called.
   * @param {string} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
   * @param {Array} [args] - Extra arguments to apply to the hook call.
   * @returns {boolean} false if any of the plugins return false, else returns true.
   */
  notify(chart: Chart, hook: string, args: any[]): boolean;
  invalidate(): void;
}

export interface IPlugin<O = {}> {
  id: string;

  /**
   * @desc Called before initializing `chart`.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  beforeInit?(chart: Chart, options: O): void;
  /**
   * @desc Called after `chart` has been initialized and before the first update.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterInit?(chart: Chart, options: O): void;
  /**
   * @desc Called before updating `chart`. If any plugin returns `false`, the update
   * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart update.
   */
  beforeUpdate?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after `chart` has been updated and before rendering. Note that this
   * hook will not be called if the chart update has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterUpdate?(chart: Chart, options: O): void;
  /**
   * @desc Called during chart reset
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @since version 3.0.0
   */
  reset?(chart: Chart, options: O): void;
  /**
   * @desc Called before updating the `chart` datasets. If any plugin returns `false`,
   * the datasets update is cancelled until another `update` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} false to cancel the datasets update.
   * @since version 2.1.5
   */
  beforeDatasetsUpdate?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after the `chart` datasets have been updated. Note that this hook
   * will not be called if the datasets update has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @since version 2.1.5
   */
  afterDatasetsUpdate?(chart: Chart, options: O): void;
  /**
   * @desc Called before updating the `chart` dataset at the given `args.index`. If any plugin
   * returns `false`, the datasets update is cancelled until another `update` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {number} args.index - The dataset index.
   * @param {object} args.meta - The dataset metadata.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart datasets drawing.
   */
  beforeDatasetUpdate?(chart: Chart, args: { index: number; meta: IChartMeta }, options: O): boolean | void;
  /**
   * @desc Called after the `chart` datasets at the given `args.index` has been updated. Note
   * that this hook will not be called if the datasets update has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {number} args.index - The dataset index.
   * @param {object} args.meta - The dataset metadata.
   * @param {object} options - The plugin options.
   */
  afterDatasetUpdate?(chart: Chart, args: { index: number; meta: IChartMeta }, options: O): void;
  /**
   * @desc Called before laying out `chart`. If any plugin returns `false`,
   * the layout update is cancelled until another `update` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart layout.
   */
  beforeLayout?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after the `chart` has been laid out. Note that this hook will not
   * be called if the layout update has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterLayout?(chart: Chart, options: O): void;
  /**
   * @desc Called before rendering `chart`. If any plugin returns `false`,
   * the rendering is cancelled until another `render` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart rendering.
   */
  beforeRender?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after the `chart` has been fully rendered (and animation completed). Note
   * that this hook will not be called if the rendering has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterRender?(chart: Chart, options: O): void;
  /**
   * @desc Called before drawing `chart` at every animation frame. If any plugin returns `false`,
   * the frame drawing is cancelled untilanother `render` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart drawing.
   */
  beforeDraw?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after the `chart` has been drawn. Note that this hook will not be called
   * if the drawing has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterDraw?(chart: Chart, options: O): void;
  /**
   * @desc Called before drawing the `chart` datasets. If any plugin returns `false`,
   * the datasets drawing is cancelled until another `render` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart datasets drawing.
   */
  beforeDatasetsDraw?(chart: Chart, options: O): boolean | void;
  /**
   * @desc Called after the `chart` datasets have been drawn. Note that this hook
   * will not be called if the datasets drawing has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  afterDatasetsDraw?(chart: Chart, options: O): void;
  /**
   * @desc Called before drawing the `chart` dataset at the given `args.index` (datasets
   * are drawn in the reverse order). If any plugin returns `false`, the datasets drawing
   * is cancelled until another `render` is triggered.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {number} args.index - The dataset index.
   * @param {object} args.meta - The dataset metadata.
   * @param {object} options - The plugin options.
   * @returns {boolean} `false` to cancel the chart datasets drawing.
   */
  beforeDatasetDraw?(chart: Chart, args: { index: number; meta: IChartMeta }, options: O): boolean | void;
  /**
   * @desc Called after the `chart` datasets at the given `args.index` have been drawn
   * (datasets are drawn in the reverse order). Note that this hook will not be called
   * if the datasets drawing has been previously cancelled.
   * @param {Chart} chart - The chart instance.
   * @param {object} args - The call arguments.
   * @param {number} args.index - The dataset index.
   * @param {object} args.meta - The dataset metadata.
   * @param {object} options - The plugin options.
   */
  afterDatasetDraw?(chart: Chart, args: { index: number; meta: IChartMeta }, options: O): void;
  /**
   * @desc Called before processing the specified `event`. If any plugin returns `false`,
   * the event will be discarded.
   * @param {Chart} chart - The chart instance.
   * @param {IEvent} event - The event object.
   * @param {object} options - The plugin options.
   * @param {boolean} replay - True if this event is replayed from `Chart.update`
   */
  beforeEvent?(chart: Chart, event: IEvent, options: O, replay: boolean): void;
  /**
   * @desc Called after the `event` has been consumed. Note that this hook
   * will not be called if the `event` has been previously discarded.
   * @param {Chart} chart - The chart instance.
   * @param {IEvent} event - The event object.
   * @param {object} options - The plugin options.
   * @param {boolean} replay - True if this event is replayed from `Chart.update`
   */
  afterEvent?(chart: Chart, event: IEvent, options: O, replay: boolean): void;
  /**
   * @desc Called after the chart as been resized.
   * @param {Chart} chart - The chart instance.
   * @param {number} size - The new canvas display size (eq. canvas.style width & height).
   * @param {object} options - The plugin options.
   */
  resize?(chart: Chart, size: number, options: O): void;
  /**
   * Called after the chart as been destroyed.
   * @param {Chart} chart - The chart instance.
   * @param {object} options - The plugin options.
   */
  destroy?(chart: Chart, options: O): void;
}

export declare type IChartComponentLike = IChartComponent | IChartComponent[] | { [key: string]: IChartComponent };

/**
 * Please use the module's default export which provides a singleton instance
 * Note: class is exported for typedoc
 */
export interface Registry {
  readonly controllers: TypedRegistry<DatasetController>;
  readonly elements: TypedRegistry<Element>;
  readonly plugins: TypedRegistry<IPlugin>;
  readonly scales: TypedRegistry<Scale>;

  add(...args: IChartComponentLike[]): void;
  remove(...args: IChartComponentLike[]): void;

  addControllers(...args: IChartComponentLike[]): void;
  addElements(...args: IChartComponentLike[]): void;
  addPlugins(...args: IChartComponentLike[]): void;
  addScales(...args: IChartComponentLike[]): void;

  getController(id: string): DatasetController | undefined;
  getElement(id: string): Element | undefined;
  getPlugin(id: string): IPlugin | undefined;
  getScale(id: string): Scale | undefined;
}

export const registry: Registry;

export interface ITick {
  value: number;
  label?: string;
  major?: boolean;
}

export interface IScaleOptions {
  /**
   * Controls the axis global visibility (visible when true, hidden when false). When display: 'auto', the axis is visible only if at least one associated dataset is visible.
   * @default true
   */
  display: boolean | 'auto';
  /**
   * Reverse the scale.
   * @default false
   */
  reverse: boolean;
  /**
   * The weight used to sort the axis. Higher weights are further away from the chart area.
   * @default true
   */
  weight: number;
  /**
   * Callback called before the update process starts.
   */
  beforeUpdate(axis: Scale): void;
  /**
   * Callback that runs before dimensions are set.
   */
  beforeSetDimensions(axis: Scale): void;
  /**
   * Callback that runs after dimensions are set.
   */
  afterSetDimensions(axis: Scale): void;
  /**
   * Callback that runs before data limits are determined.
   */
  beforeDataLimits(axis: Scale): void;
  /**
   * Callback that runs after data limits are determined.
   */
  afterDataLimits(axis: Scale): void;
  /**
   * Callback that runs before ticks are created.
   */
  beforeBuildTicks(axis: Scale): void;
  /**
   * Callback that runs after ticks are created. Useful for filtering ticks.
   */
  afterBuildTicks(axis: Scale): void;
  /**
   * Callback that runs before ticks are converted into strings.
   */
  beforeTickToLabelConversion(axis: Scale): void;
  /**
   * Callback that runs after ticks are converted into strings.
   */
  afterTickToLabelConversion(axis: Scale): void;
  /**
   * Callback that runs before tick rotation is determined.
   */
  beforeCalculateTickRotation(axis: Scale): void;
  /**
   * Callback that runs after tick rotation is determined.
   */
  afterCalculateTickRotation(axis: Scale): void;
  /**
   * Callback that runs before the scale fits to the canvas.
   */
  beforeFit(axis: Scale): void;
  /**
   * Callback that runs after the scale fits to the canvas.
   */
  afterFit(axis: Scale): void;
  /**
   * Callback that runs at the end of the update process.
   */
  afterUpdate(axis: Scale): void;
}

export interface Scale<O extends IScaleOptions = IScaleOptions> extends Element<{}, O>, IChartArea {
  readonly id: string;
  readonly type: string;
  readonly ctx: CanvasRenderingContext2D;
  readonly chart: Chart;

  width: number;
  height: number;

  maxWidth: number;
  maxHeight: number;

  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;

  axis: string;
  labelRotation: number;
  min: number;
  max: number;
  ticks: ITick[];
  getMatchingVisibleMetas(type?: string): IChartMeta[];

  draw(chartArea: IChartArea): void;
  drawTitle(chartArea: IChartArea): void;
  drawLabels(chartArea: IChartArea): void;
  drawGrid(chartArea: IChartArea): void;

  /**
   * @param {number} pixel
   * @return {number}
   */
  getDecimalForPixel(pixel: number): number;
  /**
   * Utility for getting the pixel location of a percentage of scale
   * The coordinate (0, 0) is at the upper-left corner of the canvas
   * @param {number} decimal
   * @return {number}
   */
  getPixelForDecimal(decimal: number): number;
  /**
   * Returns the location of the tick at the given index
   * The coordinate (0, 0) is at the upper-left corner of the canvas
   * @param {number} index
   * @return {number}
   */
  getPixelForTick(index: number): number;
  /**
   * Used to get the label to display in the tooltip for the given value
   * @param {*} value
   * @return {string}
   */
  getLabelForValue(value: number): string;
  /**
   * Returns the location of the given data point. Value can either be an index or a numerical value
   * The coordinate (0, 0) is at the upper-left corner of the canvas
   * @param {*} value
   * @param {number} [index]
   * @return {number}
   */
  getPixelForValue(value: number, index: number): number;

  /**
   * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
   * The coordinate (0, 0) is at the upper-left corner of the canvas
   * @param {number} pixel
   * @return {*}
   */
  getValueForPixel(pixel: number): number | undefined;

  getBaseValue(): number;
  /**
   * Returns the pixel for the minimum chart value
   * The coordinate (0, 0) is at the upper-left corner of the canvas
   * @return {number}
   */
  getBasePixel(): number;

  init(options: O): void;
  parse(raw: any, index: number): any;
  getUserBounds(): { min: number; max: number; minDefined: boolean; maxDefined: boolean };
  getMinMax(canStack: boolean): { min: number; max: number };
  invalidateCaches(): void;
  getPadding(): IChartArea;
  getTicks(): ITick[];
  getLabels(): string[];
  beforeUpdate(): void;
  update(maxWidth: number, maxHeight: number, margins: any): void;
  configure(): void;
  afterUpdate(): void;
  beforeSetDimensions(): void;
  setDimensions(): void;
  afterSetDimensions(): void;
  beforeDataLimits(): void;
  determineDataLimits(): void;
  afterDataLimits(): void;
  beforeBuildTicks(): void;
  buildTicks(): ITick[];
  afterBuildTicks(): void;
  beforeTickToLabelConversion(): void;
  generateTickLabels(ticks: ITick[]): void;
  afterTickToLabelConversion(): void;
  beforeCalculateLabelRotation(): void;
  calculateLabelRotation(): void;
  afterCalculateLabelRotation(): void;
  beforeFit(): void;
  fit(): void;
  afterFit(): void;

  isHorizontal(): boolean;
  isFullWidth(): boolean;
}
export const Scale: {
  prototype: Scale;
  new <O extends IScaleOptions = IScaleOptions>(cfg: any): Scale<O>;
};

export interface IScriptAbleScaleContext {
  chart: Chart;
  scale: Scale;
  index: number;
  tick: ITick;
}

export type ScriptAbleScale<T> = T | ((ctx: IScriptAbleScaleContext) => T);

export const Ticks: {
  formatters: {
    /**
     * Formatter for value labels
     * @param value the value to display
     * @return {string|string[]} the label to display
     */
    values(value: any): string | string[];
    /**
     * Formatter for numeric ticks
     * @param tickValue the value to be formatted
     * @param index the position of the tickValue parameter in the ticks array
     * @param ticks the list of ticks being converted
     * @return string representation of the tickValue parameter
     */
    numeric(tickValue: number, index: number, ticks: { value: number }[]): string;
    /**
     * Formatter for logarithmic ticks
     * @param tickValue the value to be formatted
     * @param index the position of the tickValue parameter in the ticks array
     * @param ticks the list of ticks being converted
     * @return string representation of the tickValue parameter
     */
    logarithmic(tickValue: number, index: number, ticks: { value: number }[]): string;
  };
};

export interface TypedRegistry<T> {
  /**
   * @param {IChartComponent} item
   * @returns {string} The scope where items defaults were registered to.
   */
  register(item: IChartComponent): string;
  get(id: string): T | undefined;
  unregister(item: IChartComponent): void;
}
