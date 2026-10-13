<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'inbox'
  }
})
</script>

<template>
  <div class="empty-state">
    <q-icon
      :name="icon"
      size="56px"
      class="empty-icon"
    />

    <h2 class="empty-title">
      {{ title }}
    </h2>

    <p
      v-if="description"
      class="empty-description"
    >
      {{ description }}
    </p>

    <div class="empty-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
}

.empty-description {
  max-width: 480px;
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 20px;
}
</style>