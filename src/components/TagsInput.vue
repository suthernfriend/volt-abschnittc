<script setup lang="ts">

import {ref, useTemplateRef} from "vue";

const model = defineModel<string[]>({ required: true });
const vl = ref<string>("")

const props = defineProps<{}>();

const inputElement = useTemplateRef<HTMLInputElement>("inputElement");

function keyDownInput(ev: KeyboardEvent) {
  const next = vl.value;

  if (ev.key === "Backspace" && next === "") {
    model.value.pop();
    ev.preventDefault();
  }

  if (ev.key === "Enter" || ev.key === "Tab") {
    if (next === "")
      return;
    model.value.push(next);
    vl.value = "";
    ev.preventDefault();
  }
}

</script>

<template>
  <div class="tags-input">
    <span v-for="item in model" class="tag is-rounded">{{ item }}</span>
    <input @keydown="keyDownInput" v-model="vl" ref="inputElement" class="input" type="text">
  </div>
</template>

<style lang="scss">
.tags-input {
  display: flex;
  flex-direction: row;
  border-radius: var(--bulma-input-radius);
  background-color: hsl(221, 14%, calc(100% + 0%));
  border-color: hsl(221, 14%, calc(86% + 0%));
  border-style: solid;
  padding-left: 0.5em;
  border-width: var(--bulma-control-border-width);
  color: hsl(var(--bulma-input-h), var(--bulma-input-s), var(--bulma-input-color-l));
  box-shadow: inset 0 0.0625em 0.125em hsla(var(--bulma-scheme-h), var(--bulma-scheme-s), var(--bulma-scheme-invert-l), 0.05);

  span {
    margin: 0.6em 0;
  }

  input {
    border: none;
    outline: none;
    flex: 1;
  }

  input:focus {
    border: none;
    box-shadow: none;
  }

  &:focus-within {
    border-color: hsl(var(--bulma-input-focus-h), var(--bulma-input-focus-s), var(--bulma-input-focus-l));
    box-shadow: var(--bulma-input-focus-shadow-size) hsla(var(--bulma-input-focus-h), var(--bulma-input-focus-s), var(--bulma-input-focus-l), var(--bulma-input-focus-shadow-alpha));
  }
}

</style>
