import { View, Text, ScrollView, Pressable, TouchableHighlight } from "@/tw";

export function TailwindTest() {
  return (
    <ScrollView className="flex-1 bg-slate-100">
      <View className="p-4 gap-6">
        <Text className="text-3xl font-extrabold text-slate-900">
          Tailwind CSS v4 Test
        </Text>
        <Text className="text-base text-slate-600">
          NativeWind v5 with react-native-css
        </Text>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Typography</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <Text className="text-xs text-slate-500">Extra Small (12px)</Text>
            <Text className="text-sm text-slate-600">Small (14px)</Text>
            <Text className="text-base text-slate-700">Base (16px)</Text>
            <Text className="text-lg text-slate-800">Large (18px)</Text>
            <Text className="text-xl text-slate-900">XLarge (20px)</Text>
            <Text className="text-2xl text-slate-900">2XL (24px)</Text>
            <Text className="font-light">Light weight</Text>
            <Text className="font-normal">Normal weight</Text>
            <Text className="font-medium">Medium weight</Text>
            <Text className="font-semibold">Semibold weight</Text>
            <Text className="font-bold">Bold weight</Text>
            <Text className="font-extrabold">Extra bold weight</Text>
            <Text className="italic text-slate-700">Italic text</Text>
            <Text className="underline text-blue-600">Underlined text</Text>
            <Text className="line-through text-red-500">Line-through text</Text>
            <Text className="text-left">Left aligned</Text>
            <Text className="text-center">Center aligned</Text>
            <Text className="text-right">Right aligned</Text>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Colors - Background</Text>
          <View className="flex-row gap-2 flex-wrap">
            <View className="w-16 h-16 bg-red-500 rounded-lg" />
            <View className="w-16 h-16 bg-orange-500 rounded-lg" />
            <View className="w-16 h-16 bg-amber-500 rounded-lg" />
            <View className="w-16 h-16 bg-yellow-500 rounded-lg" />
            <View className="w-16 h-16 bg-lime-500 rounded-lg" />
            <View className="w-16 h-16 bg-green-500 rounded-lg" />
            <View className="w-16 h-16 bg-emerald-500 rounded-lg" />
            <View className="w-16 h-16 bg-teal-500 rounded-lg" />
            <View className="w-16 h-16 bg-cyan-500 rounded-lg" />
            <View className="w-16 h-16 bg-sky-500 rounded-lg" />
            <View className="w-16 h-16 bg-blue-500 rounded-lg" />
            <View className="w-16 h-16 bg-indigo-500 rounded-lg" />
            <View className="w-16 h-16 bg-violet-500 rounded-lg" />
            <View className="w-16 h-16 bg-purple-500 rounded-lg" />
            <View className="w-16 h-16 bg-fuchsia-500 rounded-lg" />
            <View className="w-16 h-16 bg-pink-500 rounded-lg" />
            <View className="w-16 h-16 bg-rose-500 rounded-lg" />
          </View>
          <View className="flex-row gap-2 flex-wrap">
            <View className="w-16 h-16 bg-slate-900 rounded-lg" />
            <View className="w-16 h-16 bg-slate-700 rounded-lg" />
            <View className="w-16 h-16 bg-slate-500 rounded-lg" />
            <View className="w-16 h-16 bg-slate-300 rounded-lg" />
            <View className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200" />
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Colors - Text</Text>
          <View className="bg-white rounded-xl p-4 gap-2 shadow-sm">
            <Text className="text-red-600">Red text</Text>
            <Text className="text-orange-600">Orange text</Text>
            <Text className="text-amber-600">Amber text</Text>
            <Text className="text-green-600">Green text</Text>
            <Text className="text-blue-600">Blue text</Text>
            <Text className="text-purple-600">Purple text</Text>
            <Text className="text-pink-600">Pink text</Text>
            <Text className="text-slate-900">Slate 900</Text>
            <Text className="text-slate-700">Slate 700</Text>
            <Text className="text-slate-500">Slate 500</Text>
            <Text className="text-slate-300">Slate 300</Text>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Spacing - Padding</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <View className="bg-slate-100 p-1">
              <Text className="text-sm">p-1</Text>
            </View>
            <View className="bg-slate-200 p-2">
              <Text className="text-sm">p-2</Text>
            </View>
            <View className="bg-slate-300 p-4">
              <Text className="text-sm">p-4</Text>
            </View>
            <View className="bg-slate-400 p-6">
              <Text className="text-sm text-white">p-6</Text>
            </View>
            <View className="bg-slate-500 p-8">
              <Text className="text-sm text-white">p-8</Text>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-blue-100 px-4 py-2">
                <Text className="text-sm text-center">px-4 py-2</Text>
              </View>
              <View className="flex-1 bg-blue-200 px-6 py-3">
                <Text className="text-sm text-center">px-6 py-3</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Spacing - Margin</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="bg-red-100 m-2">
              <Text className="text-sm text-center">m-2</Text>
            </View>
            <View className="bg-red-200 m-4">
              <Text className="text-sm text-center">m-4</Text>
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-green-100 mx-4 my-2">
                <Text className="text-sm text-center">mx-4 my-2</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Borders & Rounded</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <View className="border-2 border-slate-300 rounded-none p-3">
              <Text className="text-sm">rounded-none</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-sm p-3">
              <Text className="text-sm">rounded-sm</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-md p-3">
              <Text className="text-sm">rounded-md</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-lg p-3">
              <Text className="text-sm">rounded-lg</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-xl p-3">
              <Text className="text-sm">rounded-xl</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-2xl p-3">
              <Text className="text-sm">rounded-2xl</Text>
            </View>
            <View className="border-2 border-slate-300 rounded-full p-3">
              <Text className="text-sm">rounded-full</Text>
            </View>
            <View className="border-4 border-red-500 rounded-lg p-3">
              <Text className="text-sm text-red-600">border-4 border-red-500</Text>
            </View>
            <View className="border-t-4 border-b-4 border-blue-500 rounded-lg p-3">
              <Text className="text-sm text-blue-600">border-t-4 border-b-4</Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Flexbox</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">flex-row</Text>
              <View className="flex-row gap-2">
                <View className="bg-blue-500 w-10 h-10 rounded" />
                <View className="bg-green-500 w-10 h-10 rounded" />
                <View className="bg-red-500 w-10 h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">flex-col</Text>
              <View className="flex-col gap-2">
                <View className="bg-blue-500 w-full h-10 rounded" />
                <View className="bg-green-500 w-full h-10 rounded" />
                <View className="bg-red-500 w-full h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">justify-start</Text>
              <View className="flex-row justify-start gap-2">
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">justify-center</Text>
              <View className="flex-row justify-center gap-2">
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">justify-end</Text>
              <View className="flex-row justify-end gap-2">
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
                <View className="bg-purple-500 w-10 h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">justify-between</Text>
              <View className="flex-row justify-between gap-2">
                <View className="bg-orange-500 w-10 h-10 rounded" />
                <View className="bg-orange-500 w-10 h-10 rounded" />
                <View className="bg-orange-500 w-10 h-10 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">items-start</Text>
              <View className="flex-row items-start gap-2 h-20">
                <View className="bg-teal-500 w-10 h-6 rounded" />
                <View className="bg-teal-500 w-10 h-10 rounded" />
                <View className="bg-teal-500 w-10 h-14 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">items-center</Text>
              <View className="flex-row items-center gap-2 h-20">
                <View className="bg-teal-500 w-10 h-6 rounded" />
                <View className="bg-teal-500 w-10 h-10 rounded" />
                <View className="bg-teal-500 w-10 h-14 rounded" />
              </View>
            </View>
            <View className="bg-slate-100 rounded-lg p-3">
              <Text className="text-sm mb-2">flex-1</Text>
              <View className="flex-row gap-2">
                <View className="flex-1 bg-indigo-500 h-10 rounded">
                  <Text className="text-white text-center text-xs py-2">flex-1</Text>
                </View>
                <View className="flex-1 bg-indigo-500 h-10 rounded">
                  <Text className="text-white text-center text-xs py-2">flex-1</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Width & Height</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <View className="w-full h-8 bg-cyan-500 rounded mb-2">
              <Text className="text-white text-center text-sm py-1">w-full</Text>
            </View>
            <View className="w-20 h-8 bg-emerald-500 rounded">
              <Text className="text-white text-center text-sm py-1">w-20</Text>
            </View>
            <View className="w-32 h-8 bg-emerald-600 rounded">
              <Text className="text-white text-center text-sm py-1">w-32</Text>
            </View>
            <View className="w-48 h-8 bg-emerald-700 rounded">
              <Text className="text-white text-center text-sm py-1">w-48</Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Shadows</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <View className="bg-white shadow-sm rounded-lg p-4 border border-slate-200">
              <Text className="text-sm">shadow-sm</Text>
            </View>
            <View className="bg-white shadow rounded-lg p-4 border border-slate-200">
              <Text className="text-sm">shadow</Text>
            </View>
            <View className="bg-white shadow-md rounded-lg p-4 border border-slate-200">
              <Text className="text-sm">shadow-md</Text>
            </View>
            <View className="bg-white shadow-lg rounded-lg p-4 border border-slate-200">
              <Text className="text-sm">shadow-lg</Text>
            </View>
            <View className="bg-white shadow-xl rounded-lg p-4 border border-slate-200">
              <Text className="text-sm">shadow-xl</Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Interactive</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <Pressable className="bg-blue-500 rounded-lg p-4">
              <Text className="text-white text-center font-semibold">Pressable (press me)</Text>
            </Pressable>
            <Pressable className="bg-green-500 rounded-lg p-4">
              <Text className="text-white text-center font-semibold">Another button</Text>
            </Pressable>
            <TouchableHighlight className="bg-purple-500 rounded-lg p-4">
              <Text className="text-white text-center font-semibold">TouchableHighlight (press me)</Text>
            </TouchableHighlight>
            <Pressable className="border-2 border-slate-300 rounded-lg p-4">
              <Text className="text-slate-700 text-center font-semibold">Outlined button</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-lg font-bold text-slate-800">Gap</Text>
          <View className="bg-white rounded-xl p-4 gap-3 shadow-sm">
            <Text className="text-sm text-slate-600 mb-1">gap-1</Text>
            <View className="flex-row gap-1 mb-3">
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
            </View>
            <Text className="text-sm text-slate-600 mb-1">gap-2</Text>
            <View className="flex-row gap-2 mb-3">
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
            </View>
            <Text className="text-sm text-slate-600 mb-1">gap-4</Text>
            <View className="flex-row gap-4 mb-3">
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
            </View>
            <Text className="text-sm text-slate-600 mb-1">gap-6</Text>
            <View className="flex-row gap-6">
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
              <View className="bg-pink-500 w-8 h-8 rounded" />
            </View>
          </View>
        </View>

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}
