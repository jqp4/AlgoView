struct Param {
  String name;
  int start;
  int end;
}

class Params {

public:
  Params() {
    for (size_t i = 0; i < 3; i++) {
      params.push_back(Param{"_", 0, 0});
    }
  }

  add_param(String name, int start_value, int start_value) {
    assert(n < 3, "Пока только трехмерные графы");
    params[n] = Param{
        name,
        start_value,
        start_value,
    };

    n++;
  }

private:
  const qwr;
  int n = 0;
  std::vector<Param> params = {};
}