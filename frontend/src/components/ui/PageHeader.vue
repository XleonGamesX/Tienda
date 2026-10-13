<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="page-header">
    <div>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-description">
        {{ description }}
      </p>
    </div>

    <div class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
}

.page-description {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-title {
    font-size: 24px;
  }

  .page-actions {
    width: 100%;
  }
}
</style>