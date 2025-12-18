<script setup lang="ts">
import { Code2 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center space-x-2">
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-[#3873f4]"
    >
      <Code2 class="w-4 h-4" :stroke-width="3" />
    </div>
    <span class="text-lg font-bold text-slate-900 dark:text-white">
      InterviewVault
    </span>
  </div>
</template>
