import { Component, For, Show, createMemo, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";

const TEST_NUMBER = 10_000.25;
const DECIMAL = ",";
const GROUP = ".";

const DECIMAL_SYMBOL = ".";

export const Numbers: Component = () => {
  const [locale, setLocale] = createSignal("default");

  const formatter = createMemo(
    () =>
      new Intl.NumberFormat(locale(), {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 20,
        minimumFractionDigits: 0,
      })
  );

  const [cursor, setCursor] = createStore<{
    start?: number;
    end?: number;
    direction: HTMLInputElement["selectionDirection"];
    selectionLength: number;
    mapped: { start: number; end: number };
  }>({
    end: undefined,
    direction: "forward",
    get selectionLength() {
      if (!this.end) return 0;
      return this.end - this.start;
    },
    get mapped() {
      if (this.direction === "forward") {
        return { start: this.start, end: this.end };
      }
      return { start: this.end, end: this.start };
    },
  });

  const [value, setValue] = createStore({
    number: TEST_NUMBER,
    get formatted() {
      return formatter().format(this.number);
    },
    get parts() {
      return formatter().formatToParts(this.number);
    },
  });

  function trackCursor(ev: Event & { currentTarget: HTMLInputElement }) {
    setCursor(
      produce((state) => {
        state.start = ev.currentTarget.selectionStart || 0;
        state.end = ev.currentTarget.selectionEnd || 0;
        state.direction = ev.currentTarget.selectionDirection || "forward";
      })
    );
  }

  return (
    <>
      <input
        class="input-transitional"
        type="text"
        value={
          /*@once*/
          value.formatted
        }
        inputMode="decimal"
        onClick={trackCursor}
        onKeyUp={trackCursor}
        onInput={(ev) => {
          const re = new RegExp(`^-|[0-9]|${DECIMAL}`, "g");

          const val =
            ev.target.value.match(re)?.join("").replace(DECIMAL, ".") || "0";
          const number = parseFloat(val);

          setValue("number", number);
        }}
      />
      <output>
        <div class="mockedCursor">
          <Show when={cursor.start !== undefined}>
            <div
              class="cursor cursor-start"
              data-index={cursor.start}
              data-direction={cursor.direction}
              data-length={Array(cursor.selectionLength).fill(" ").join("")}
              innerText={Array(cursor.start).fill(" ").join("")}
            ></div>
          </Show>
          <Show when={cursor.selectionLength}>
            <div
              class="cursor cursor-end"
              data-index={cursor.end}
              data-direction={cursor.direction}
              data-length={Array(cursor.selectionLength).fill(" ").join("")}
              innerText={Array(cursor.end).fill(" ").join("")}
            ></div>
          </Show>

          <input
            class="input-final"
            type="text"
            value={value.formatted}
            inputMode="decimal"
            onInput={(ev) => {
              const floatRegeExp = new RegExp(`^-|[0-9]|${DECIMAL}`, "g");

              const { value: currentInputValue = "0" } = ev.currentTarget;

              const extractedInputValue =
                currentInputValue
                  .match(floatRegeExp)
                  ?.join("")
                  .replace(DECIMAL, DECIMAL_SYMBOL) || "0";

              const inputValueAsNumber = parseFloat(extractedInputValue);

              const currentSelectionStart =
                ev.currentTarget.selectionStart || 0;

              // don't update the formatting if the user is deleting the last decimal, since it most likely will be followed by number
              if (extractedInputValue.at(-1) === DECIMAL_SYMBOL) {
                return;
              }

              setValue("number", inputValueAsNumber);

              // update the formatting in case of no number change
              if (value.number === inputValueAsNumber) {
                ev.currentTarget.value = value.formatted;
              }

              const reverseIndex =
                value.formatted.length -
                currentInputValue.length +
                currentSelectionStart;

              let newIndex = reverseIndex;

              // console.log(
              //   "meh",
              //   extractedInputValue,
              //   currentSelectionStart,
              //   newIndex
              // );

              if (currentSelectionStart === 0) {
                newIndex = 0;
              } else {
                if (
                  !floatRegeExp.test(
                    value.formatted.at(reverseIndex - 1) || "0"
                  )
                ) {
                  newIndex--;
                }
              }

              ev.currentTarget.setSelectionRange(newIndex, newIndex);
            }}
          />
        </div>

        <input
          class="input-final"
          type="text"
          value={value.formatted}
          inputMode="decimal"
          readOnly
          disabled
        />

        <pre>{JSON.stringify(value, undefined, 2)}</pre>
      </output>
    </>
  );
};
