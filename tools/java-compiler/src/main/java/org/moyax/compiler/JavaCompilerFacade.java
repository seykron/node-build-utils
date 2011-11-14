package org.moyax.compiler;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

import javax.tools.Diagnostic;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.ToolProvider;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Invokes the system Java compiler and returns the results in JSON format.
 *
 * @author Matias Mirabelli &lt;lumen.night@gmail.com&gt;
 * @since 0.0.1
 */
public class JavaCompilerFacade {

  /** System compiler used to build java source files. Cannot be null. */
  private final JavaCompiler compiler;

  /**
   * Compiles a list of Java source files.
   *
   * @param args List of Java source files.
   */
  public static void main(final String[] args) {
    JavaCompilerFacade facade = new JavaCompilerFacade(ToolProvider
        .getSystemJavaCompiler());

    HashSet<File> files = new HashSet<File>();

    for (String file : args) {
      files.add(new File(file));
    }

    CompilerContext context = facade.newContext(files);

    try {
      JSONArray result = new JSONArray(facade.compile(context));
      System.out.println(result.toString());
    } catch(JSONException cause) {
      throw new IllegalStateException("Cannot create a JSON result.", cause);
    }
  }

  /**
   * Creates a new facade and sets the compiler used to build java source files.
   *
   * @param theCompiler Compiler to build files. Cannot be null.
   */
  public JavaCompilerFacade(final JavaCompiler theCompiler) {
    compiler = theCompiler;
  }

  /**
   * Creates a new context and adds a set of files.
   *
   * @param files Files to add to the context. Cannot be null.
   *
   * @return A valid {@link CompilerContext}.
   */
  public CompilerContext newContext(final Collection<File> files) {
    CompilerContext context = new CompilerContext(compiler);
    context.addSourceFiles(files);

    return context;
  }

  /**
   * Compiles the specified context and converts the results to a list
   * of JSONObject objects.
   *
   * @param context Context to compile. Cannot be null.
   *
   * @return A list of results in the form of {@link JSONObject}. An empty
   *    list if there're no messages. Never returns null.
   * @throws JSONException if a result object cannot be created.
   */
  public List<JSONObject> compile(final CompilerContext context)
      throws JSONException {

    ArrayList<JSONObject> result = new ArrayList<JSONObject>();

    if (!context.compile()) {
      for (Diagnostic<? extends JavaFileObject> diagnostic :
        context.getDiagnostics()) {

        JSONObject object = new JSONObject();
        object.put("kind", diagnostic.getKind().name());
        object.put("code", diagnostic.getCode());
        object.put("source", diagnostic.getSource().toUri());
        object.put("lineNumber", diagnostic.getLineNumber());
        object.put("columnNumber", diagnostic.getColumnNumber());
        object.put("message", diagnostic.getMessage(Locale.getDefault()));
        object.put("startPosition", diagnostic.getStartPosition());
        object.put("position", diagnostic.getPosition());
        object.put("endPosition", diagnostic.getEndPosition());

        result.add(object);
      }
    }

    return result;
  }
}
