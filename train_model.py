import tensorflow as tf
from tensorflow.keras.applications import Xception
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, Model

# ── Config ─────────────────────────────
IMG_SIZE = (299, 299)
BATCH_SIZE = 32
EPOCHS = 10

TRAIN_DIR = "dataset/train"
VAL_DIR   = "dataset/val"

# ── Data Generators ────────────────────
train_datagen = ImageDataGenerator(
    rescale=1./255,
    horizontal_flip=True,
    rotation_range=10,
    zoom_range=0.1
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary"
)

val_gen = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary"
)

# ── Model (Pretrained + Fine-tuning) ───
base = Xception(weights="imagenet", include_top=False, input_shape=(299, 299, 3))

# Freeze most layers
for layer in base.layers[:-30]:
    layer.trainable = False

# Fine-tune last layers
for layer in base.layers[-30:]:
    layer.trainable = True

x = base.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.Dropout(0.5)(x)
output = layers.Dense(1, activation="sigmoid")(x)

model = Model(inputs=base.input, outputs=output)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ── Training ───────────────────────────
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS
)

# ── Save Model ─────────────────────────
model.save("cnn_model.h5")
print("✅ Model saved as cnn_model.h5")
